import { FormEvent, useEffect, useState } from "react";
import { Brand } from "../components/Brand";
import { BackIcon, CheckIcon, GoogleIcon, LockIcon, StarIcon } from "../components/Icons";
import { track } from "../lib/analytics";

const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJ5eFmKdxWwqcRtZUk-KprhcU";
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 2000;

type Props = {
  onBack: () => void;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

async function submitFeedback(payload: { rating: number | null; comments: string; website: string }) {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_REAL_API !== "true") {
    return;
  }

  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Feedback delivery failed");
  }
}

export function FeedbackPage({ onBack }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const trimmedComments = comments.trim();
  const isValid = trimmedComments.length >= MIN_COMMENT_LENGTH && trimmedComments.length <= MAX_COMMENT_LENGTH;

  useEffect(() => track("feedback_page_view"), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || status === "submitting") return;

    setStatus("submitting");
    try {
      await submitFeedback({ rating, comments: trimmedComments, website });
      setStatus("success");
      track("feedback_submit_success");
    } catch {
      setStatus("error");
      track("feedback_submit_error");
    }
  };

  if (status === "success") {
    return (
      <main className="page-shell">
        <section className="app-card app-card--success" aria-labelledby="success-heading" aria-live="polite">
          <Brand />
          <div className="success-icon">
            <CheckIcon />
          </div>
          <header className="page-heading page-heading--success">
            <h1 id="success-heading">Thank you</h1>
            <p>Your feedback has been sent to the Zaberman team.</p>
          </header>
          <div className="success-actions">
            <button className="button button--primary" type="button" onClick={onBack}>
              Back to start
            </button>
            <a
              className="button button--secondary"
              href={GOOGLE_REVIEW_URL}
              onClick={() => track("feedback_google_click")}
            >
              <GoogleIcon />
              Leave a review on Google
            </a>
          </div>
          <PrivacyNote />
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="app-card app-card--form" aria-labelledby="feedback-heading">
        <div className="form-topbar">
          <button className="back-button" type="button" onClick={onBack}>
            <BackIcon />
            Back
          </button>
          <Brand />
          <span aria-hidden="true" />
        </div>

        <header className="page-heading page-heading--form">
          <h1 id="feedback-heading">Send private feedback</h1>
          <p>Tell us what happened or how we can improve. Your message goes directly to the Zaberman team and is not published.</p>
        </header>

        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="rating-fieldset">
            <legend>
              Rating <span>(optional)</span>
            </legend>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  className={value <= (rating ?? 0) ? "star-button star-button--selected" : "star-button"}
                  type="button"
                  key={value}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating((current) => (current === value ? null : value))}
                >
                  <StarIcon />
                </button>
              ))}
              {rating !== null ? (
                <button className="rating-clear" type="button" onClick={() => setRating(null)}>
                  Clear
                </button>
              ) : null}
            </div>
          </fieldset>

          <label className="field-label" htmlFor="comments">
            Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={comments}
            minLength={MIN_COMMENT_LENGTH}
            maxLength={MAX_COMMENT_LENGTH}
            rows={6}
            required
            placeholder="Tell us what happened or how we can improve."
            aria-describedby="comments-help comments-error"
            aria-invalid={comments.length > 0 && !isValid}
            onChange={(event) => {
              setComments(event.target.value);
              if (status === "error") setStatus("idle");
            }}
          />
          <div className="field-meta">
            <span id="comments-help">{MIN_COMMENT_LENGTH}–{MAX_COMMENT_LENGTH.toLocaleString()} characters</span>
            <span>{comments.length}/{MAX_COMMENT_LENGTH.toLocaleString()}</span>
          </div>
          <input
            className="honeypot"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            aria-hidden="true"
          />

          <div id="comments-error" className="form-message" aria-live="polite">
            {comments.length > 0 && trimmedComments.length < MIN_COMMENT_LENGTH
              ? `Please enter at least ${MIN_COMMENT_LENGTH} characters.`
              : status === "error"
                ? "We could not send your feedback. Please try again."
                : ""}
          </div>

          <button className="button button--primary" type="submit" disabled={!isValid || status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Send feedback"}
          </button>

          <div className="alternative-action">
            <span>or</span>
            <a
              className="button button--secondary"
              href={GOOGLE_REVIEW_URL}
              onClick={() => track("feedback_google_click")}
            >
              <GoogleIcon />
              Prefer to share publicly? Leave a review on Google
            </a>
          </div>

          <PrivacyNote />
        </form>
      </section>
    </main>
  );
}

function PrivacyNote() {
  return (
    <p className="privacy-note">
      <LockIcon />
      Your feedback is sent privately to the Zaberman team.
    </p>
  );
}
