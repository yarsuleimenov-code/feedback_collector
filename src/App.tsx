import { useEffect, useState } from "react";
import { FeedbackPage } from "./pages/FeedbackPage";
import { ReviewChoicePage } from "./pages/ReviewChoicePage";

const REVIEW_PATH = "/review";
const FEEDBACK_PATH = "/review/feedback";

function normalizePath(pathname: string) {
  return pathname === FEEDBACK_PATH ? FEEDBACK_PATH : REVIEW_PATH;
}

export function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", REVIEW_PATH);
    }

    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState(null, "", nextPath);
    setPath(normalizePath(nextPath));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return path === FEEDBACK_PATH ? (
    <FeedbackPage onBack={() => navigate(REVIEW_PATH)} />
  ) : (
    <ReviewChoicePage onPrivateFeedback={() => navigate(FEEDBACK_PATH)} />
  );
}

