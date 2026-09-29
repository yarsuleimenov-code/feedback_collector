# Zaberman Feedback Collector

Policy-compliant review collection for `zaberman.com/review`.

The first screen offers two equal choices:

- leave a public Google review;
- send private feedback to the Zaberman team.

Private feedback is never published and analytics receive event names only—never the rating or comment text.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/review`. In development, successful feedback submission is simulated in the browser. Set `VITE_USE_REAL_API=true` to call the API locally.

## Production setup

The Vercel function in `api/feedback.ts` sends email through the Resend HTTP API.

Required environment variables:

```text
RESEND_API_KEY=re_...
FEEDBACK_FROM_EMAIL=Zaberman Feedback <feedback@your-verified-domain.com>
```

Optional:

```text
FEEDBACK_TO_EMAIL=a@zaberman.com
```

Deploy to Vercel with `npm run build`; `vercel.json` routes `/review` and `/review/feedback` to the SPA while preserving `/api/feedback`.

## Verification

```bash
npm run build
npm run typecheck
```

