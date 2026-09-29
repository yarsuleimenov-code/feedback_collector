import { useEffect } from "react";
import { Brand } from "../components/Brand";
import { ArrowIcon, GoogleIcon, MailIcon, PinIcon } from "../components/Icons";
import { track } from "../lib/analytics";

const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJ5eFmKdxWwqcRtZUk-KprhcU";

type Props = {
  onPrivateFeedback: () => void;
};

export function ReviewChoicePage({ onPrivateFeedback }: Props) {
  useEffect(() => track("review_page_view"), []);

  return (
    <main className="page-shell">
      <section className="app-card app-card--choice" aria-labelledby="review-heading">
        <Brand />
        <header className="page-heading">
          <h1 id="review-heading">How would you like to share your experience?</h1>
          <p>Your feedback helps us improve and helps other customers make informed decisions.</p>
        </header>

        <div className="choice-grid">
          <a
            className="choice-panel choice-panel--public"
            href={GOOGLE_REVIEW_URL}
            onClick={() => track("review_public_click")}
          >
            <span className="choice-panel__icon choice-panel__icon--google">
              <GoogleIcon />
            </span>
            <span className="choice-panel__title">
              Leave a public review
              <ArrowIcon />
            </span>
            <span className="choice-panel__copy">Share your experience on Google</span>
          </a>

          <button
            className="choice-panel choice-panel--private"
            type="button"
            onClick={() => {
              track("review_private_click");
              onPrivateFeedback();
            }}
          >
            <span className="choice-panel__icon">
              <MailIcon />
            </span>
            <span className="choice-panel__title">
              Send private feedback
              <ArrowIcon />
            </span>
            <span className="choice-panel__copy">Tell the Zaberman team directly</span>
          </button>
        </div>

        <div className="location-band">
          <PinIcon />
          <span className="location-band__divider" aria-hidden="true" />
          <span>
            <strong>Zaberman</strong>
            <span>3202 McKnight E Dr #169, Pittsburgh, PA 15237</span>
          </span>
        </div>

        <footer className="app-footer">Thank you for choosing Zaberman.</footer>
      </section>
    </main>
  );
}

