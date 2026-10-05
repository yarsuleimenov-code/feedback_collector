import { useEffect } from "react";
import { Brand } from "../components/Brand";
import { ArrowIcon, GoogleIcon, MailIcon } from "../components/Icons";
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
              Message the CEO
              <ArrowIcon />
            </span>
            <span className="choice-panel__copy">Private and direct</span>
          </button>
        </div>
      </section>
    </main>
  );
}
