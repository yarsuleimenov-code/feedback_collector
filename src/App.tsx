import { useEffect, useState } from "react";
import { FeedbackPage } from "./pages/FeedbackPage";
import { ReviewChoicePage } from "./pages/ReviewChoicePage";

const REVIEW_PATH = "/review";
const FEEDBACK_PATH = "/review/feedback";
const USE_HASH_ROUTING = import.meta.env.BASE_URL !== "/";

function normalizePath(pathname: string) {
  return pathname === FEEDBACK_PATH ? FEEDBACK_PATH : REVIEW_PATH;
}

function readCurrentPath() {
  return normalizePath(USE_HASH_ROUTING ? window.location.hash.slice(1) : window.location.pathname);
}

export function App() {
  const [path, setPath] = useState(readCurrentPath);

  useEffect(() => {
    if (USE_HASH_ROUTING && !window.location.hash) {
      window.history.replaceState(null, "", `${import.meta.env.BASE_URL}#${REVIEW_PATH}`);
    } else if (!USE_HASH_ROUTING && window.location.pathname === "/") {
      window.history.replaceState(null, "", REVIEW_PATH);
    }

    const onPopState = () => setPath(readCurrentPath());
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, []);

  const navigate = (nextPath: string) => {
    const nextUrl = USE_HASH_ROUTING ? `${import.meta.env.BASE_URL}#${nextPath}` : nextPath;
    window.history.pushState(null, "", nextUrl);
    setPath(normalizePath(nextPath));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return path === FEEDBACK_PATH ? (
    <FeedbackPage onBack={() => navigate(REVIEW_PATH)} />
  ) : (
    <ReviewChoicePage onPrivateFeedback={() => navigate(FEEDBACK_PATH)} />
  );
}
