# Production Deployment Checklist

Step-by-step for deploying this to Vercel for the first time, plus a
pre-launch checklist. Zero-config — no `vercel.json` is needed; Vercel
auto-detects Next.js.

## 1. Push to GitHub
```bash
git init
git add .
git commit -m "CreatorOS AI — Next.js migration, production release"
git remote add origin <your-repo-url>
git push -u origin main
```
`.gitignore` already excludes `node_modules`, `.next`, and `.env.local` —
your real secrets won't be committed.

## 2. Import into Vercel
1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected, no changes needed).
3. Don't deploy yet — add environment variables first (next step).

## 3. Environment variables
In Vercel → Project → Settings → Environment Variables, add every
variable from `.env.example` with your **real production values**:

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same value as local dev (same Supabase project) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same value as local dev |
| `AI_PROVIDER` | `groq` |
| `GROQ_API_KEY` | Your production Groq key |
| `GROQ_MODEL` | Optional, defaults to `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Use your **live** key (`rzp_live_...`) for real payments, not test |
| `RAZORPAY_KEY_SECRET` | Live secret — mark as "Sensitive" in Vercel's UI |
| `NEXT_PUBLIC_SITE_URL` | Your production domain, e.g. `https://creatoros.ai` — used for SEO metadata, sitemap, and OAuth redirect matching |

Set these for the **Production** environment at minimum; add them to
Preview/Development too if you want preview deploys to work end-to-end
(using test keys there instead of live ones is recommended).

**Critical:** `NEXT_PUBLIC_*` variables are baked into the JavaScript
bundle at **build time**, not read at runtime. If you add or change one
in Vercel's dashboard after a deployment already exists, you must
**redeploy** (Deployments → ⋯ → Redeploy) for it to take effect — saving
the env var alone does nothing to an already-built deployment. Skipping
this step is the most common cause of "it works locally but not in
production" for this app.

## 4. Update Supabase for your production domain
Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** your production domain
- **Redirect URLs:** add `https://<your-domain>/**`

If you kept `http://localhost:3000/**` from local dev, leave it — you
can have multiple redirect URLs registered at once.

## 5. Update Google OAuth for your production domain
Google Cloud Console → your OAuth Client → Authorized redirect URIs:
confirm `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
is present (this doesn't change per-deployment — it's Supabase's callback,
not your app's domain).

## 6. Run the database schema (if not already applied)
Supabase Dashboard → SQL Editor → paste `supabase/schema.sql` → Run.
Safe to run even if some tables already exist (`create table if not
exists` throughout). The `payments` table is the one most likely to be
new for your production project — see `PRODUCTION_AUDIT.md`.

## 7. Deploy
Click Deploy in Vercel. First build should complete with no errors.

## 8. Post-deploy smoke test
Run through this on the live URL before announcing launch:
- [ ] Landing page loads, no console errors
- [ ] Sign up with a real test email → check `profiles` table in Supabase
- [ ] Google sign-in completes and redirects back correctly
- [ ] Generate from at least 3 different tools (e.g. Hook Generator,
      Script Writer, Caption Writer) — confirm real AI content returns
- [ ] Hit the free-tier limit (4th generation in a day) and confirm the
      block message appears
- [ ] Save a generation → confirm it appears in Library
- [ ] Complete a real (or Razorpay test-mode, if you deployed with test
      keys) payment → confirm plan badge flips to "Pro" without a reload
- [ ] Check `payments` table has a new row after a successful payment
- [ ] Visit `/robots.txt` and `/sitemap.xml` on the live domain — confirm
      they resolve and list the expected URLs
- [ ] Test on an actual phone, not just a resized browser window

## 9. Optional hardening for scale
Not required for launch, but worth planning for:
- Dedicated rate limiting (e.g. Upstash Ratelimit) in front of
  `/api/generate` if usage grows beyond what the per-user daily cap
  reasonably prevents.
- Razorpay webhook as a secondary confirmation path for the rare case of
  a user closing the tab immediately after a successful payment before
  the checkout callback fires (current flow is secure and correct
  without this — see `PRODUCTION_AUDIT.md`).
- Uptime monitoring / error tracking (e.g. Sentry) wired into
  `app/error.tsx` and `app/global-error.tsx`'s `console.error` calls.

## Rollback
Vercel keeps every deployment — if something breaks, use Vercel →
Deployments → find the last known-good deployment → "Promote to
Production." No code changes needed for an emergency rollback.
