# Setup Guide

Fixes the `Error: supabaseUrl is required` you hit, and covers full setup
from a clean clone.

## 1. Install
```
npm install
```

## 2. Environment variables
**This is what caused the error.** Next.js only reads `.env.local` (not
`.env.example`) — this zip now ships a real `.env.local` at the
project root with your public Supabase URL/key already filled in, so you
should NOT need to do anything here. Just confirm the file exists:
```
cat .env.local
```
If you don't see `NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co`, the
file didn't survive the unzip/copy — recreate it with:
```
NEXT_PUBLIC_SUPABASE_URL=https://kpmmuvjvtexncrsslgli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_gxvjHJTCVFx5egq8-w4cXQ_vs9fy5SM
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
**Restart `npm run dev` after any change to `.env.local`** — Next.js only
loads env files at server start, so editing the file with the dev server
already running won't take effect until you restart it.

`NEXT_PUBLIC_SITE_URL` powers SEO metadata, `sitemap.xml`, and Open Graph
URLs — keep it as `http://localhost:3000` for local dev, and set it to
your real domain when deploying (see `DEPLOYMENT_CHECKLIST.md`).

The AI provider (§2a) and Razorpay (§2b) sections below need your real
key values filled in — everything else in `.env.local` is already
correct as shipped.

## 2a. AI provider setup (required for generation to work)
Every tool (scripts, hooks, captions, hashtags, CTAs, etc.) and AI Chat
call the same `/api/generate` endpoint, which calls a real AI provider.
This project is configured for **Groq**, matching your live app.

**Groq (default, already selected in `.env.local`):**
```
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...              # from https://console.groq.com/keys
GROQ_MODEL=llama-3.3-70b-versatile   # optional, this is the default
```
Groq exposes an OpenAI-compatible endpoint
(`https://api.groq.com/openai/v1/chat/completions`), so any model Groq
hosts works by changing `GROQ_MODEL` — no code changes needed. You only
need to fill in `GROQ_API_KEY`; `AI_PROVIDER` and `GROQ_MODEL` already
have sensible defaults.

Two other providers are also supported if you ever need them — same
pattern, just switch `AI_PROVIDER` and fill in the matching key:

<details>
<summary>OpenAI</summary>

```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...        # from https://platform.openai.com/api-keys
OPENAI_MODEL=gpt-4o-mini     # optional, this is the default
```
</details>

<details>
<summary>Anthropic (Claude)</summary>

```
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-... # from https://console.anthropic.com/settings/keys
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929   # optional, this is the default
```
</details>

Restart `npm run dev` after editing `.env.local`.

If `GROQ_API_KEY` isn't set, `/api/generate` returns a clear 500 error
naming the missing variable instead of crashing — you'll see it as a
toast in the UI ("GROQ_API_KEY is not set...") rather than a silent
failure.

## 2b. Razorpay setup (required for the Pro upgrade to work)
The "Upgrade to Pro" button in Profile calls a real Razorpay checkout now.
Server-side order creation and payment signature verification are both
implemented — you just need your account's keys.

**1. Get your keys** — Razorpay Dashboard → Settings → API Keys →
"Generate Test Key" (for local dev) or use your live keys (for
production). You'll get a `key_id` and a `key_secret`.

**2. Add them to `.env.local`:**
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```
`NEXT_PUBLIC_RAZORPAY_KEY_ID` is not secret (it's how Razorpay's
checkout.js identifies your account, same as your original app already
exposed it client-side) — but `RAZORPAY_KEY_SECRET` must **never** be
prefixed with `NEXT_PUBLIC_` or it would leak to the browser. It's only
read in `app/api/payments/*` server routes.

**3. Test the flow (test mode):** with `rzp_test_...` keys, Razorpay's
checkout accepts these standard test cards — no real money moves:
- Card: `4111 1111 1111 1111`, any future expiry, any CVV
- UPI (test): success is simulated automatically in test mode

**4. Go live:** swap both env vars for your live keys
(`rzp_live_...` / live secret) when you're ready to accept real payments,
and restart the app (or redeploy).

**How the flow works (for your reference):**
1. User clicks "Upgrade to Pro" → client asks
   `POST /api/payments/create-order` (authenticated via their Supabase
   session token) → route creates a Razorpay order server-side using
   `RAZORPAY_KEY_SECRET` (never exposed to the browser).
2. Razorpay's checkout.js opens using the returned `order_id`.
3. On successful payment, Razorpay calls back into the app with
   `razorpay_payment_id` + `razorpay_signature`.
4. Client sends those to `POST /api/payments/verify`, which recomputes
   the HMAC-SHA256 signature server-side and compares it — this is the
   only trusted proof a payment actually happened.
5. Only after that check passes does the route update
   `profiles.plan = 'pro'` in Supabase (via a client scoped to that
   user's own access token, so it goes through the same
   `profiles: update own` RLS policy a normal request would) and logs
   the payment in the new `payments` table for your own audit trail.

No webhook is required for this flow to work correctly — verification
happens synchronously in the browser's checkout callback. If you want a
second layer of reliability for edge cases (user closes the tab right
after paying, before the callback fires), Razorpay also supports webhooks
you could add later as a belt-and-suspenders backstop; not required for
the current flow to be secure or correct.

## 3. Run it
```
npm run dev
```
Open http://localhost:3000 — you should land on the marketing page with
no console errors.

## 4. Authentication setup (Supabase dashboard)
Your Supabase project already has this configured (the original app has
working auth in production), but if you're pointing this at a **new**
project or troubleshooting, check:

1. **Authentication → Providers**
   - Email: enabled
   - Google: enabled, with your OAuth Client ID/Secret from the Google
     Cloud Console
2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` for local dev (add your production
     domain too — Supabase supports multiple redirect URLs)
   - Redirect URLs: add `http://localhost:3000/**` and your production
     domain's equivalent
3. Google Cloud Console → OAuth Client → Authorized redirect URIs must
   include your Supabase project's callback URL:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`

If Google sign-in redirects but never completes, it's almost always a
mismatch in step 2 or 3.

## 5. Database schema
Your production Supabase project already has the `profiles`,
`daily_usage`, and `generations` tables (the live app depends on them).
`supabase/schema.sql` in this project is a **reference copy** matching
what the migrated code (`lib/supabase/data.ts`) expects — useful for:
- Verifying your existing tables/columns match (Supabase Dashboard →
  Table Editor, compare column names/types against the SQL file)
- Spinning up a second Supabase project (staging/dev) with the same shape

**New in Phase 5:** `supabase/schema.sql` now also defines a `payments`
table (order/payment id + status, for audit purposes) that almost
certainly does **not** exist in your production project yet — the
original app may not have had this table at all. **You need to run this
one** for the "Save to Library"-style audit log to work; the Pro upgrade
itself still works even without it (the insert is best-effort and won't
block the upgrade if the table is missing), but you'll lose the payment
history record.

To run it against a project: **Supabase Dashboard → SQL Editor → paste
the contents of `supabase/schema.sql` → Run.** It uses
`create table if not exists` and `drop policy if exists` throughout, so
it's safe to run even if some tables already exist — it won't drop data.

## 6. Sanity checklist
- [ ] `.env.local` exists and has real (non-empty) Supabase values
- [ ] `npm run dev` starts with no `supabaseUrl is required` error
- [ ] `AI_PROVIDER=groq` and `GROQ_API_KEY` is filled in
- [ ] Landing page loads at `/`
- [ ] Sign up with a test email creates a row in `profiles`
- [ ] Generating from any tool (e.g. Hook Generator) returns real AI
      content, not an error toast
- [ ] Saving a generation creates a row in `generations`
- [ ] Google sign-in completes and redirects back to `/home`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are filled
      in (test keys are fine for local dev)
- [ ] `payments` table exists (ran `supabase/schema.sql`, or already had
      an equivalent table)
- [ ] Clicking "Upgrade to Pro" opens Razorpay checkout
- [ ] Completing a test payment (card `4111 1111 1111 1111`) upgrades the
      plan badge to "Pro" without a page reload

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| `supabaseUrl is required` | `.env.local` missing or dev server wasn't restarted after adding it |
| Generation fails with "GROQ_API_KEY is not set" | Key missing from `.env.local` — see §2a |
| Generation fails with "Groq rejected the API key (401)" | Wrong/expired key |
| Generation fails with "rate limit or quota exceeded" | Groq account hit its rate limit — try again shortly |
| Google sign-in loops back to landing | Redirect URL mismatch — see §4 |
| "row-level security policy" error on insert | RLS policy missing/misconfigured — compare against `supabase/schema.sql` |
| "Could not load the payment form" | Razorpay's checkout.js failed to load — check network/ad-blockers |
| "NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set" | Missing from `.env.local` — see §2b |
| Razorpay checkout opens but rejects the key | Using a live key in test mode or vice versa — key prefix (`rzp_test_` / `rzp_live_`) must match the mode you're testing in |
| "Payment signature verification failed" | Should only happen on tampered/replayed requests — if it happens on a genuine payment, double-check `RAZORPAY_KEY_SECRET` matches the same account that issued `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| Plan upgraded but no `payments` row | The `payments` table doesn't exist yet — run `supabase/schema.sql` (§5). The upgrade itself is unaffected. |
