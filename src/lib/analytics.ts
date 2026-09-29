declare global {
  interface Window {
    dataLayer?: Array<Record<string, string>>;
  }
}

export type ReviewEvent =
  | "review_page_view"
  | "review_public_click"
  | "review_private_click"
  | "feedback_page_view"
  | "feedback_submit_success"
  | "feedback_submit_error"
  | "feedback_google_click";

export function track(event: ReviewEvent) {
  window.dataLayer?.push({ event });
}

