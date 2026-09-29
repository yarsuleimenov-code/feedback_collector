# Zaberman Feedback Collector

Policy-compliant review collection for `zaberman.com/review`.

The first screen offers two equal choices:

- leave a public Google review;
- send private feedback to the Zaberman team.

Private feedback is never published. A valid email address or phone number is required for follow-up, and analytics receive event names only—never the contact details, rating, or comment text.

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

## GitHub Pages preview

Pushes to `main` are built and published by `.github/workflows/deploy-pages.yml`.
The Pages build uses `/feedback_collector/` as the asset base and hash routing so refreshes work on static hosting.

GitHub Pages hosts only the frontend preview. It cannot run `api/feedback.ts`; use Vercel or another serverless host for real email delivery.

## Verification

```bash
npm run build
npm run typecheck
```
