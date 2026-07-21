# CreatorOS AI — Next.js Migration Log

Migrating from the original single-file `index.html` (vanilla JS + Supabase +
Razorpay) to Next.js 14 (App Router) + React + TypeScript. Goal: preserve
every feature exactly — no UI redesign, no feature removal.

## How to run this locally
```
npm install
cp .env.example .env.local   # already has the real public Supabase values
npm run dev
```
Network access wasn't available while generating this project, so
`npm install` has not been run and nothing has been build-tested yet —
do that first and report any type errors back to me to fix.

## Status

### ✅ Phase 0 — Project scaffold
Next.js 14 App Router + TypeScript config, `package.json`, env template.

### ✅ Phase 1 — Global styles + static routes
`app/globals.css` (verbatim CSS), landing page, Privacy/Terms/Contact
routes, `data/tools.ts` (all 21 tools), auth modal UI shell.

### ✅ Phase 2 — Data layer, real auth, and all remaining screens
- `lib/supabase/data.ts` — `ensureProfile`, `loadPlan`, `getTodayUsage`,
  `incUsage`, `canGenerate`, `saveGeneration`, `getGenerations`,
  `deleteGeneration` against the `profiles` / `daily_usage` / `generations`
  tables.
- `contexts/SessionContext.tsx` — real Supabase session state
  (`onAuthStateChange`), used app-wide.
- `components/AuthModal.tsx` — now calls real `signInWithPassword`,
  `signUp`, `signInWithOAuth('google')`.
- `hooks/useRequireAuth.ts` — redirects to `/` if not logged in.
- `components/BottomNav.tsx` — 5-item nav (Home / Tools / Chat / Library /
  Profile).
- `app/home` — dashboard.
- `app/tools` — searchable/filterable tools grid.
- `app/tools/[id]` — tool detail: dynamic inputs, usage-gated generation,
  result card with copy/save/regenerate.
- `app/chat` — AI chat.
- `app/library` — saved generations, with delete/copy.
- `app/profile` — account info, plan badge, logout, links to legal pages.
- `components/SubscriptionModal.tsx` — upgrade UI (Free vs Pro plan cards).
- `app/api/generate/route.ts` — generation endpoint (see assumption below).

### ✅ Phase 3 — Toasts, loading states, code audit
Note: the Dashboard, all Tool pages, AI Chat, Library, and Profile were
already fully migrated in Phase 2 above — there was no remaining logic
sitting in `index.html` to port. Phase 3 closes the two real gaps that
were left open:
- `contexts/ToastContext.tsx` — wires the `.toast` CSS (present since
  Phase 1 but unused) to a `useToast()` hook. Now fires on: login,
  signup, logout, copy-to-clipboard (Tool Detail + Library), save to
  Library, delete from Library, and generation/chat errors.
- `components/ScreenLoader.tsx` — every screen that gates on auth
  (`home`, `tools`, `tools/[id]`, `chat`, `library`, `profile`, and the
  landing page's redirect) now shows a real loading state instead of
  returning `null` while the session resolves, removing a blank-screen
  flash.
- Verified all import paths and brace/paren balance across every file
  touched in Phase 2 — no logic changes to that code, audit only.

No new npm dependencies were added in Phase 3.

### ✅ Phase 4a — Fixed the "supabaseUrl is required" crash + Supabase completeness
Root cause: the project shipped `.env.example` but never an actual
`.env.local`. Next.js only reads `.env.local` — if the manual copy step
was skipped, `NEXT_PUBLIC_SUPABASE_URL` was `undefined` at runtime, which
is exactly what throws `supabaseUrl is required` from supabase-js.

Fixed by:
- Shipping a real `.env.local` directly in this zip with your public
  Supabase URL/key already filled in — no manual copy step needed anymore.
- Adding a clear, actionable error in `lib/supabase/client.ts` if env vars
  are ever missing in the future, instead of the cryptic supabase-js
  message.
- Adding `.gitignore` so `.env.local` doesn't get committed if you push
  this to GitHub.
- `supabase/schema.sql` — reference schema (tables, indexes, RLS
  policies) matching what `lib/supabase/data.ts` expects, for verifying
  against your live project or spinning up a staging project.
- `SETUP.md` — step-by-step guide covering install, env config, Supabase
  auth provider setup (email + Google), schema verification, and a
  troubleshooting table.

**Note on naming:** this env/Supabase fix landed before the AI-provider
work below — labeled 4a since both are part of closing out "real Phase 4."

No new npm dependencies were added here either — `@supabase/supabase-js`
was already in `package.json` from Phase 0.

### ✅ Phase 4b (this delivery) — Real AI provider wired in
Replaced the OpenAI-only placeholder with a small provider abstraction:
- `lib/ai/types.ts` — shared `AIProvider` interface + `AIProviderError`
  (carries an HTTP status so the route handler can return accurate error
  codes instead of a generic 500).
- `lib/ai/openai.ts` — real OpenAI chat completions call (plain `fetch`,
  no SDK added).
- `lib/ai/anthropic.ts` — real Anthropic messages API call (same
  approach).
- `lib/ai/index.ts` — `getAIProvider()` reads `AI_PROVIDER` from
  `.env.local` (`"openai"` default, or `"anthropic"`) and returns the
  matching implementation. This is the only place that decides which
  provider runs — no per-tool code changes were needed, since every tool
  in `data/tools.ts` already builds its full prompt client-side and this
  layer just executes whatever prompt it receives.
- `app/api/generate/route.ts` — now calls `getAIProvider().generate()`
  and maps `AIProviderError` to the right status/message (missing key →
  500 with the exact variable name, bad key → 500, rate limit → 429,
  provider outage → 502). Errors surface as toasts in the UI instead of
  silent failures.

This automatically covers **every** tool — Script Writer, Hook Generator,
Caption Writer, Hashtag Generator, Reel Ideas, Carousel Generator, Video
Titles, YouTube Description, CTA Generator, Content Calendar, Bio
Generator, Brand Name Generator, Username Generator, Product Description,
Ad Copy, Email Writer, AI Rewrite, SEO Keywords, Story Ideas, Poll
Generator, TikTok Script — plus AI Chat, since they all route through the
same endpoint.

**Confirmed:** you use Groq — `AI_PROVIDER` now defaults to `"groq"` and
`GROQ_API_KEY` is the only key you need to fill in. See Phase 4c below.

No new npm dependencies were added — both providers are called via the
native `fetch` API already available in Next.js's server runtime.

### ✅ Phase 4c (this delivery) — Groq support
Added a third provider matching your confirmed setup:
- `lib/ai/groq.ts` — calls Groq's OpenAI-compatible endpoint
  (`https://api.groq.com/openai/v1/chat/completions`), same
  request/response shape as OpenAI so the implementation mirrors
  `lib/ai/openai.ts` almost exactly.
- `lib/ai/index.ts` — `AI_PROVIDER` now defaults to `"groq"` (was
  `"openai"`); still supports switching to `"openai"` or `"anthropic"` if
  ever needed.
- `.env.local` / `.env.example` — `GROQ_API_KEY` and `GROQ_MODEL`
  (defaults to `llama-3.3-70b-versatile`) added; `AI_PROVIDER=groq` is
  now the active setting.
- `SETUP.md` §2a rewritten to lead with Groq as the primary path, with
  OpenAI/Anthropic kept as collapsed alternatives.

No architecture or UI changes — this only touches the `lib/ai/` provider
layer and env files, exactly as before. Same per-tool coverage (all 21
tools + AI Chat) since nothing about the prompt-building or route
contract changed.

No new npm dependencies — Groq's endpoint is called via `fetch`.

### ✅ Phase 5 (this delivery) — Real Razorpay integration
Replaced the fully-stubbed upgrade button with a real, secure payment
flow. New files:
- `lib/razorpay/client.ts` — server-side order creation (REST call with
  Basic Auth, no SDK dependency added) and HMAC-SHA256 signature
  verification via Node's built-in `crypto` module (constant-time
  comparison to avoid timing attacks).
- `lib/razorpay/loadScript.ts` — loads `checkout.js` on demand client-side
  when the upgrade modal opens, deduping if already loaded.
- `lib/supabase/serverAuth.ts` — resolves a Supabase access token to a
  real user server-side (`getUserFromToken`), and returns a Supabase
  client scoped to that user's own token (`getUserScopedClient`) so
  database writes go through the same Row Level Security policies a
  normal client request would. No service-role key is used anywhere in
  the payments flow.
- `lib/payments/constants.ts` — single source of truth for the ₹299/mo
  Pro price (shared between the UI and the order-creation route).
- `app/api/payments/create-order/route.ts` — authenticates the caller,
  then creates a Razorpay order server-side using `RAZORPAY_KEY_SECRET`
  (never sent to the browser).
- `app/api/payments/verify/route.ts` — the only place that can upgrade a
  user's plan. Recomputes the Razorpay signature server-side (never
  trusts a client "payment succeeded" claim), confirms it matches, then
  updates `profiles.plan = 'pro'` and logs the payment to a new
  `payments` table for audit purposes.
- `components/SubscriptionModal.tsx` — rewritten (same UI/CSS, no visual
  change) to actually open Razorpay checkout, verify on success, refresh
  the session so the Pro badge updates instantly, and surface errors via
  the existing `sub-limit-note` element and toast system.
- `supabase/schema.sql` — added a `payments` table (order id, payment id,
  status, RLS policies). **This table likely doesn't exist in your
  production project yet** — see `SETUP.md` §5.

**Security notes:**
- The plan upgrade can only happen after a server-side signature check
  passes — there's no code path where the client can claim success
  without it.
- The Razorpay secret key never reaches the browser; only the public
  `key_id` (via `NEXT_PUBLIC_RAZORPAY_KEY_ID`) does, same as the original
  app already exposed client-side.
- No webhook is required for correctness — verification is synchronous
  in the checkout callback — but one could be added later as a
  belt-and-suspenders backstop for the rare case of a user closing the
  tab immediately after paying.

No new npm dependencies — Razorpay's REST API is called via `fetch`,
signature verification uses Node's built-in `crypto`.

### ✅ Phase 6 (this delivery) — Final production release
Production hardening, optimization, and audit pass. Full details in the
new `PRODUCTION_AUDIT.md`; summary here:

**Security (one real bug found and fixed):** `/api/generate` had no
authentication check at all — a direct API call could bypass the
free-tier 3/day limit entirely, since that limit was previously only
enforced client-side. Now requires a verified Supabase access token and
re-checks the limit server-side before calling the AI provider or
incrementing usage. `app/tools/[id]/page.tsx` and `app/chat/page.tsx`
updated to send the token; their redundant client-side `incUsage()` calls
were removed (the server does it now, exactly once, only on success).
Also added: security headers (`next.config.mjs`), disabled the
`X-Powered-By` header, capped prompt length, confirmed no service-role
key is used anywhere and no secret ever reaches the client bundle.

**SEO:** `app/robots.ts` and `app/sitemap.ts` added (new — didn't exist
before). Auth-gated screens (`/home`, `/tools` grid, `/chat`, `/library`,
`/profile`) now `noindex` via per-segment layouts; `/tools/[id]` pages
stay indexable since they're publicly viewable and reasonable landing
pages per tool. `metadataBase` and a title template added to
`app/layout.tsx`.

**Performance:** `AuthModal` and `SubscriptionModal` are now lazy-loaded
via `next/dynamic` — smaller initial bundle on the landing page and
Profile, identical rendered output when opened. All three `/api/*` routes
marked `force-dynamic` to make explicit they're never cached.

**Error handling:** added `app/error.tsx`, `app/global-error.tsx`, and
`app/not-found.tsx` — none existed before, so an unexpected error
previously fell through to Next.js's unstyled default screen.

**Mobile responsiveness:** audited, no changes made — the app was
mobile-first from Phase 1 onward and this phase deliberately didn't touch
layout/CSS, per the standing "don't redesign" constraint. See
`PRODUCTION_AUDIT.md` for the specific things checked.

**Dead code:** no unused npm dependencies found (all four were in use).
Removed two now-unused imports (`incUsage` in two files) as a direct
consequence of the security fix above — nothing else was pruned, with
CSS specifically left untouched since several classes are applied
dynamically and couldn't be confidently confirmed unused by static
analysis alone.

**New docs:** `README.md` (GitHub landing doc), `DEPLOYMENT_CHECKLIST.md`
(step-by-step Vercel deployment), `PRODUCTION_AUDIT.md` (full findings
table by category). `.env.local.example` retired in favor of a single
canonical `.env.example`, now including `NEXT_PUBLIC_SITE_URL` for
SEO/sitemap purposes.

No new npm dependencies were added — everything in this phase uses
Next.js/React built-ins (`next/dynamic`, the `robots`/`sitemap`
metadata-file conventions, Node's `crypto` was already in use since
Phase 5).

## ⚠️ Reconstructed pieces — verify against your original before shipping
I did not have access to the original `/api` folder or the tail of
`index.html`'s JS (lines ~1000–1319), so the following are my best-effort
reconstructions from the CSS class names and app structure, not verbatim
ports. Please sanity-check these against your live site's actual behavior:

1. **`lib/ai/*` + `app/api/generate/route.ts`** — calls a real provider.
   Confirmed: Groq (`AI_PROVIDER=groq`), using Groq's OpenAI-compatible
   endpoint. OpenAI and Anthropic remain available as fallback options if
   ever needed, but Groq is what's active. Only remaining unknown is the
   exact model/prompt tuning your original app may have used — defaults
   to `llama-3.3-70b-versatile`, adjustable via `GROQ_MODEL`.
2. **Razorpay payment flow** — now a real, working integration (order
   creation, signature verification, plan upgrade). **Still an
   assumption:** the exact price (₹299/mo, in `lib/payments/constants.ts`)
   and plan structure (single Pro tier) match what was visible in the UI
   copy from the original app, but I never saw your original order-
   creation file, so double-check the amount and currency match exactly
   what you intend to charge before going live.
3. **`components/BottomNav.tsx`** — I guessed a 5-item nav (Home, Tools,
   Chat, Library, Profile) based on the screens present in the CSS. Confirm
   the exact icons/order/labels match your original bottom nav.
4. **`app/chat/page.tsx`** — the message flow (user bubble → AI bubble,
   "New Chat" button) is inferred from `.chat-*` CSS classes only; I didn't
   have the original `sendChat()` function.
5. **`daily_usage` upsert** — `lib/supabase/data.ts` assumes a unique
   constraint on `(user_id, date)` for the upsert conflict target. If your
   table uses a different constraint name/shape, the increment logic needs
   adjusting.
6. **Google OAuth redirect** — set to `window.location.origin`; confirm
   this matches the redirect URL(s) allow-listed in your Supabase project
   and Google OAuth client.

## Migration complete
All 6 phases are done. This is a production-ready release — see
`DEPLOYMENT_CHECKLIST.md` to actually go live.

### ✅ Phase 7 (this delivery) — Fixed production crash: "Something went wrong"
**Root cause:** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
were never added to Vercel's environment variables — only `.env.local`
had them, which is correctly gitignored and never reaches a deployment.
`getSupabaseBrowserClient()` threw on missing config exactly as designed,
but that throw happened inside `SessionContext`'s effect, which runs in
the root layout on every page — so it escalated past the per-route
`app/error.tsx` boundary all the way to `app/global-error.tsx`, showing
the generic "Something went wrong. Please try reloading the page."
message everywhere, with server logs showing nothing unusual (the crash
is entirely client-side, after a successful 200 response).

**Fixed by:**
- `lib/supabase/client.ts` — added `getMissingSupabaseEnvVars()`, a
  non-throwing check `SessionContext` can call up front.
- `contexts/SessionContext.tsx` — checks config before attempting any
  Supabase call; if misconfigured, renders `<ConfigError>` (naming the
  exact missing variable) instead of `{children}`, rather than letting an
  uncaught throw crash the whole tree. Also wrapped the actual
  `getSession()`/`onAuthStateChange()` calls in try/catch so a network or
  bad-URL problem degrades to "logged out" instead of crashing, and fixed
  an auth-listener cleanup bug introduced during this rewrite (subscription
  is now unsubscribed correctly on unmount).
- `components/ConfigError.tsx` — new, friendly config-error screen.
- `SETUP.md` / `DEPLOYMENT_CHECKLIST.md` — added this exact symptom to
  the troubleshooting table, plus a callout that `NEXT_PUBLIC_*` vars
  need a **redeploy** after being added in Vercel (they're baked in at
  build time, not read at runtime).

**What you need to do:** add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (and the rest of `.env.example`) in
Vercel → Project → Settings → Environment Variables, then redeploy. Once
that's done, the app should work; if any env var is still missing after
that, you'll now see exactly which one instead of a generic crash.

### ✅ Phase 8 (this delivery) — Splash screen, upgrade flow fix, AI branding, bottom nav fix
All four items requested, all additive/fixes — no existing screens were
redesigned, no routes changed, no Supabase/Groq/Razorpay logic touched.

**Premium splash screen** (new):
- `components/SplashScreen.tsx` — glassmorphism card, animated gradient
  background, 14 floating particles, animated SVG progress ring with
  live percentage, 5 cycling messages exactly as specified, ~2.5s total
  duration, fades out on completion.
- `components/AppBoot.tsx` — shows it once per browser session (via
  `sessionStorage`, not on every client-side navigation) while the real
  app continues mounting underneath in parallel, so it costs no
  perceived performance.
- Wired into `app/layout.tsx` as the outermost wrapper.

**Upgrade button fix (the actual bug):** the "Daily Limit Reached —
Upgrade to Pro" button in Tool Detail was `disabled` whenever the limit
was hit — meaning it was **never clickable at all**, which is exactly why
it "did nothing." Fixed:
- `hooks/useUpgradeFlow.ts` — shared logic: logged-in users go straight
  to `/profile?upgrade=1` (Pricing); logged-out users are sent to Login
  and automatically carried through to Pricing after signing in, via
  `lib/upgrade/intent.ts` (a one-shot `sessionStorage` flag).
- `app/profile/page.tsx` — reads `?upgrade=1` on mount, auto-opens
  `SubscriptionModal`, then cleans the URL.
- `app/page.tsx` (landing) — checks for a pending upgrade after login and
  redirects to Pricing instead of Home when one exists.
- Applied consistently to every upgrade trigger: Tool Detail's gen-btn
  (the original bug), the usage-pill's "Upgrade" link, Chat's send button
  (now an actionable upgrade CTA when the limit is hit, previously just a
  disabled dead end), and the Home page banner.
- `lib/ui/ripple.ts` + new `.ripple-container`/`.ripple-effect` CSS —
  ripple, hover-lift, and active-press feedback on every upgrade CTA,
  plus a brief "Redirecting..." loading state.
- Razorpay's post-payment `refreshProfile()` call (already correct since
  Phase 5) was confirmed still in place and untouched — the plan already
  updates instantly with no manual refresh needed.

**AI identity masking:**
- `lib/ai/systemPrompt.ts` — a `CREATOROS_SYSTEM_PROMPT` injected into
  every provider call (system message for Groq/OpenAI, the `system`
  field for Anthropic), instructing the model to always identify as
  "CreatorOS AI" using the exact wording requested, and never name the
  underlying provider/model even if asked directly.
- `lib/ai/sanitize.ts` — defense-in-depth: strips any provider/model
  names that slip through anyway (OpenAI, ChatGPT, GPT-4/3.5, Anthropic,
  Claude, Gemini, Groq, Mixtral, Llama/LLaMA) from every response, using
  specific branded terms rather than bare generic words so it can't
  corrupt unrelated content (e.g. a tool page about llamas the animal).
- `app/api/generate/route.ts` — provider-identifying error text (e.g.
  "Groq rejected the API key") is now logged server-side only; the
  client always sees generic, CreatorOS AI-branded error copy.
- Confirmed no other user-facing UI anywhere in the app referenced a
  provider name.

**Bottom navigation fix:** the "two active indicators" turned out to be
the top pill indicator (correct, working as designed) plus a default
browser underline on the `<a>` tags `next/link` renders, which the
original vanilla-JS nav (plain `<div onclick>`s, no real links) never
had to account for. Fixed with `text-decoration: none` on `.bnav-item`.
Also added a smoother indicator transition and a subtle glow on the
active icon (`filter: drop-shadow`) per the "premium navigation
animation" ask — emoji icons can't be gradient-filled via
`background-clip: text` (they're bitmap glyphs), so a glow was used
instead of a literal gradient fill.

No new npm dependencies — splash screen is pure CSS/SVG, ripple is a
plain DOM helper, no animation library added.

**Not yet done (per your ordering — next up is Phase 9):** the chat page
itself is still the pre-redesign layout; only its send-button behavior
changed in this phase. Full mobile-first redesign is Phase 9.

### ✅ Phase 9 (this delivery) — Recurring subscriptions + mobile/responsive pass
Two large, mostly-independent pieces of work.

**Real recurring subscriptions (replaces the one-time-payment flow):**
- `lib/razorpay/client.ts` — added `createRazorpaySubscription()`,
  `verifyRazorpaySubscriptionSignature()` (note: subscription checkout
  signatures use `payment_id + "|" + subscription_id`, the reverse order
  from the one-time-order flow's `order_id + "|" + payment_id` — mixing
  these up is the most common integration bug, called out explicitly in
  a code comment), and `verifyRazorpayWebhookSignature()` (a separate
  secret from the API key pair, computed over the **raw** request body).
- `app/api/payments/create-subscription/route.ts` — creates a Razorpay
  Subscription against your Plan (`RAZORPAY_PLAN_ID`), 120 billing
  cycles (10 years — effectively unlimited for a monthly plan, cancel
  anytime before then).
- `app/api/payments/verify-subscription/route.ts` — verifies the first
  payment's signature, activates Pro immediately for a responsive UI.
- `app/api/payments/webhook/route.ts` — the actual source of truth for
  the subscription's ongoing lifecycle, since renewals/failures/
  cancellations happen with no browser open to call an API route from:
  - Verifies the raw-body signature before trusting anything
  - **Idempotent**: records each `razorpay_event_id` in a new
    `webhook_events` table before acting, so Razorpay's intentional
    retry-on-failure delivery can never double-apply an effect
  - `subscription.activated` / `.charged` → plan stays/becomes "pro",
    logs the payment, updates `subscription_current_end`
  - `subscription.pending` → renewal charge failed but Razorpay is
    retrying; keeps Pro access, surfaces a "payment issue" state so the
    user isn't caught by surprise later
  - `subscription.cancelled` / `.halted` / `.completed` / `.expired` →
    downgrades to "free"
  - Uses `lib/supabase/serviceClient.ts` (new) — the **one** legitimate
    use of a Supabase service-role key anywhere in this app, since a
    server-to-server webhook call has no user session to scope a normal
    request to. Every other write in the entire app still deliberately
    avoids this and uses a user-scoped client instead.
- `app/api/payments/cancel-subscription/route.ts` — uses Razorpay's
  `cancel_at_cycle_end`, so cancelling stops future billing but Pro
  access continues until the current paid period actually ends, per
  your requirement.
- `components/SubscriptionModal.tsx` — rewritten to open subscription
  checkout (`subscription_id`) instead of order checkout (`order_id`).
- `app/profile/page.tsx` — new "Subscription" section: Current Plan,
  Status, Next Billing Date, Auto-Renew, and a two-tap "Cancel
  Subscription" button (guards against accidental taps without needing
  a whole new confirmation modal).
- `supabase/schema.sql` — `profiles` gains
  `razorpay_subscription_id` / `subscription_status` /
  `subscription_current_end`; `payments` gains
  `razorpay_subscription_id` and `razorpay_order_id` is now nullable
  (subscription-driven charges don't have an order id); new
  `webhook_events` table. All additive `alter table ... add column if
  not exists` — safe to run against your existing production tables.
- The old one-time order flow (`create-order`/`verify` routes,
  `createRazorpayOrder`/`verifyRazorpaySignature`) is untouched and still
  present, just no longer called by the UI — nothing was deleted.

**Three new env vars required** — see `SETUP.md` §2c:
`RAZORPAY_PLAN_ID`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.
**The webhook must be registered in Razorpay's Dashboard** pointing at
`/api/payments/webhook` — the subscription system does not work
correctly without it (the first payment activates Pro via the checkout
callback, but renewals/failures/cancellations have no other way to reach
your database).

**Mobile-first + responsive pass:**
- `app/globals.css` — large additive block: safe-area padding (notch/
  home-indicator devices) for bottom nav and chat input, `.glass-modal`
  (glassmorphism for the upgrade modal), touch-target minimums (~44px)
  on every previously-undersized tappable control, smooth scrolling,
  tablet breakpoint (≥640px: 3-column tool grids), desktop breakpoint
  (≥1024px: centers the phone-width layout in a fixed 480px column with
  a shadow, rather than stretching a mobile design full-bleed across a
  monitor), and subtle press/hover micro-interactions on cards.
- `app/layout.tsx` — added an explicit `.app-shell` wrapper div so the
  desktop-centering CSS has something reliable to target (App Router has
  no equivalent of Pages Router's `#__next`).
- `app/chat/page.tsx` — added a `chat-screen` class so the flex-fill
  layout fix (chat area fills all available height, no dead space,
  input pinned above the bottom nav) works via a real class rather than
  the newer `:has()` CSS selector, for broader older-Android-WebView
  compatibility.
- Every existing page's markup/structure is unchanged — this phase is
  CSS-only plus the two small structural additions above.

No new npm dependencies in either half of this phase.

### ✅ Phase 10 (this delivery) — Admin Panel foundation

**Post-delivery hotfix 1 — duplicate routes:** the Phase 10 route-group
restructure (moving every user page into `app/(app)/`) was correct in
the zip itself, but if that zip was extracted **on top of** an existing
project folder from before the restructure, the old un-grouped files
(`app/privacy/page.tsx`, `app/profile/page.tsx`, etc.) would still be
sitting on disk alongside the new `app/(app)/...` versions — most unzip
tools only add/overwrite, they never delete. Both resolving to the same
URL is exactly what Next.js's "two parallel pages" build error catches.
Fix was on the delivery/extraction side, not the code — always extract a
new zip into a clean/empty directory rather than over an existing one.

**Post-delivery hotfix 2 — `useSession must be used within
SessionProvider` during build:** after the duplicate-routes fix,
`next build` failed while statically prerendering `/`. Verified
exhaustively (every `useSession()` call site checked against the
provider tree, plus `not-found.tsx`/`error.tsx`/`global-error.tsx`/the
entire `/admin` tree checked for accidental cross-contamination) that
the component tree itself was correctly nested — this was a known
Next.js App Router quirk where a Context Provider defined in a
route-group layout (`app/(app)/layout.tsx`) can fail specifically during
**build-time static prerendering**, even though the runtime tree is
correct, because static generation renders the page before any real
request context exists. Fixed with `export const dynamic =
"force-dynamic"` on `app/(app)/layout.tsx`, which applies to every page
in the group — appropriate here since every one of those pages is
session-aware/per-visitor-different anyway, so nothing meaningful was
lost by opting out of static generation. The admin dashboard already had
the same setting from earlier in Phase 10 for the same class of reason
(it does live DB queries, never static).

**Scope note:** your Phase 10 request combined what we'd earlier agreed
would be two phases (foundation, then the full dashboard). I built the
security-critical foundation plus the highest-value, most tractable
pieces to real production quality — Dashboard, User Management,
Subscription Management, a Security page, and one Settings item
(Maintenance Mode) — rather than ship shallow stubs across all 15
requested sections. Tool Management, Coupons, a Contact/Feedback inbox,
full AI cost/token analytics, the Announcement banner system, and the
rest of Settings (price/limit/branding/AI provider via UI) are deferred
to Phase 11 — each needs either new storage infrastructure (file
uploads, a dynamic tools system replacing the static `data/tools.ts`) or
wiring into the checkout/generation flow, and deserved their own pass
rather than being rushed.

**Structural change (required, URLs unaffected):** moved every existing
user-facing route into an `app/(app)/` route group so the Admin Panel
could have its own full-width layout instead of inheriting the phone-
width `.app-shell` constraint from Phase 9. Route groups don't affect
URLs — `app/(app)/home/page.tsx` still serves `/home` exactly as before.
`app/(app)/layout.tsx` now holds what used to be in the root layout
(SessionProvider, ToastProvider, AppBoot, the `.app-shell` div); root
`app/layout.tsx` is trimmed to fonts/metadata/html/body only.

**Admin authentication — separate from user auth entirely:**
- `lib/admin/password.ts` — Node's built-in `scrypt` for password
  hashing (no new dependency like bcrypt needed).
- `lib/admin/session.ts` — signed session tokens via the Web Crypto API
  (`crypto.subtle`), deliberately NOT Node's `crypto` module, because
  this same code has to run in both Node.js API routes AND Edge
  middleware, and only Web Crypto is available in both.
- `middleware.ts` (project root) — protects every `/admin/*` page AND
  every `/api/admin/*` route at the edge, before any page/route code
  runs. This is what makes direct-URL bypass impossible: an invalid or
  missing session redirects (pages) or 401s (API routes) before
  anything else executes.
- `app/admin/(protected)/layout.tsx` — re-verifies the session
  server-side as defense in depth on top of middleware.
- `scripts/create-admin.mjs` — one-time CLI bootstrap for the first
  admin account (there's intentionally no in-app "create admin" form —
  that would be a chicken-and-egg security hole for the very first
  account).
- Login rate-limiting: 5 failed attempts per username per 15 minutes,
  same generic error message for "wrong password" and "username doesn't
  exist" (no username enumeration), every attempt logged.

**Dashboard:** `lib/admin/stats.ts` computes all ten requested stat
cards from real Supabase data via the service-role client (the only way
to see across all users — a normal user-scoped client is blocked by RLS
by design). Two growth charts (`components/admin/AdminChart.tsx`) via
plain inline SVG — no charting library dependency added.

**User Management:** list/search (by email)/filter (plan, suspension
status)/suspend/reactivate/delete/upgrade/downgrade/reset daily limit —
all real, all audit-logged. Suspension is actually **enforced**:
`contexts/SessionContext.tsx` checks `profile.suspended` on every
session load and signs the user out immediately if true, surfacing the
reason via a toast on landing (same sessionStorage-flag pattern as the
Phase 8 upgrade-intent flow). Deletion uses
`supabase.auth.admin.deleteUser()`, which cascades to
profiles/daily_usage/generations/payments automatically via their
existing foreign keys.

**Subscription Management:** list all subscriptions with status/next
billing/last payment, manual activate (comp/support cases, no payment
required), extend by N days, downgrade, and real Razorpay cancellation
(same `cancel_at_cycle_end` approach as the user-facing cancel button).

**Security page:** recent login attempts (success and failure) and the
full admin action audit log, both real tables populated by every admin
action taken anywhere in the panel.

**Settings — Maintenance Mode only this phase:** a `settings` key/value
table (more settings land as new rows later, no schema change needed).
`components/MaintenanceGate.tsx` checks `/api/settings` (a public,
read-only, single-boolean endpoint — deliberately exposes nothing else)
on every app load and shows a maintenance page to regular users when
enabled; `/admin` is a separate route tree and stays reachable so the
toggle can be turned back off.

**Database:** `admin_users`, `admin_logs`, `admin_login_attempts`,
`settings` — all with RLS **enabled and zero policies** (default deny
for every normal user request; only the service-role client, used
exclusively by already-authenticated admin routes, can ever touch
them). `profiles` gains a `suspended` column.

**New env vars** — see `SETUP.md` §2d: `ADMIN_SESSION_SECRET`. (The
service-role key from Phase 9 is reused, now also powering every admin
route.)

No new npm dependencies — password hashing, session signing, and charts
all use built-ins (Node's `crypto`, the Web Crypto API, and plain SVG).

## Optional follow-ups (not blockers, listed in PRODUCTION_AUDIT.md)
- Dedicated rate limiting (e.g. Upstash Ratelimit) in front of
  `/api/generate` for scale beyond what the per-user daily cap covers.
- A Razorpay webhook as a secondary confirmation path (current flow is
  already secure and correct without one).
- Error tracking (e.g. Sentry) wired into the new `app/error.tsx` /
  `app/global-error.tsx` boundaries.
- Run `supabase/schema.sql` against production for the `payments` audit
  table if you haven't already (Phase 5 added it; it's additive/safe).

If you want an exact match on payment amount/currency instead of the
₹299/mo assumption, or want a second pricing tier, let me know the
details and I'll adjust `lib/payments/constants.ts` and the UI copy
together.
