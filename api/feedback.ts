type FeedbackPayload = {
  rating?: number | null;
  comments?: string;
  contact?: string;
  website?: string;
};

type RateLimitRecord = { count: number; resetAt: number };

const rateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 2000;
const MAX_CONTACT_LENGTH = 254;

function isValidContact(value: string) {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const phoneDigits = value.replace(/\D/g, "");
  const isPhone = /^[+()\d\s.-]+$/.test(value) && phoneDigits.length >= 7 && phoneDigits.length <= 15;
  return value.length <= MAX_CONTACT_LENGTH && (isEmail || isPhone);
}

function sendJson(response: any, status: number, body: Record<string, unknown>) {
  response.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
}

function clientKey(request: any) {
  const forwarded = request.headers["x-forwarded-for"];
  return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : request.socket?.remoteAddress ?? "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  if (isRateLimited(clientKey(request))) {
    return sendJson(response, 429, { error: "Too many requests" });
  }

  const payload = (request.body ?? {}) as FeedbackPayload;
  if (payload.website) {
    return sendJson(response, 201, { ok: true });
  }

  const comments = typeof payload.comments === "string" ? payload.comments.trim() : "";
  const contact = typeof payload.contact === "string" ? payload.contact.trim() : "";
  const rating = payload.rating === null || payload.rating === undefined ? null : Number(payload.rating);

  if (comments.length < MIN_COMMENT_LENGTH || comments.length > MAX_COMMENT_LENGTH) {
    return sendJson(response, 400, { error: `Comments must be ${MIN_COMMENT_LENGTH}–${MAX_COMMENT_LENGTH} characters` });
  }

  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return sendJson(response, 400, { error: "Rating must be an integer from 1 to 5" });
  }

  if (!isValidContact(contact)) {
    return sendJson(response, 400, { error: "A valid email address or phone number is required" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FEEDBACK_FROM_EMAIL;
  const to = process.env.FEEDBACK_TO_EMAIL ?? "a@zaberman.com";

  if (!apiKey || !from) {
    return sendJson(response, 503, { error: "Feedback delivery is not configured" });
  }

  const requestId = crypto.randomUUID();
  const safeComments = escapeHtml(comments).replaceAll("\n", "<br />");
  const safeContact = escapeHtml(contact);
  const deliveryResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": request.headers["idempotency-key"] ?? requestId,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "New website feedback",
      html: `<h2>New website feedback</h2><p><strong>Contact:</strong> ${safeContact}</p><p><strong>Rating:</strong> ${rating ?? "Not provided"}</p><p><strong>Comments:</strong><br />${safeComments}</p><p><strong>Request ID:</strong> ${requestId}</p>`,
      text: `New website feedback\n\nContact: ${contact}\n\nRating: ${rating ?? "Not provided"}\n\nComments:\n${comments}\n\nRequest ID: ${requestId}`,
    }),
  });

  if (!deliveryResponse.ok) {
    return sendJson(response, 502, { error: "Feedback delivery failed", requestId });
  }

  return sendJson(response, 201, { ok: true, requestId });
}
