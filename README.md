# CreatorOS AI

AI content-creation platform for creators — 21 AI tools (scripts, hooks,
captions, hashtags, CTAs, and more), an AI chat assistant, saved
generation history, and a free/Pro subscription model.

Originally a single-file HTML/JS app, migrated to a production Next.js +
React + TypeScript architecture with zero UI/feature changes.

## Tech stack
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Auth & database:** Supabase (email/password + Google OAuth, Postgres
  with Row Level Security)
- **AI generation:** Groq (OpenAI-compatible endpoint), with OpenAI and
  Anthropic available as drop-in alternatives via one env var
- **Payments:** Razorpay (server-verified signatures, no client-trusted
  payment claims)
- **Styling:** hand-written CSS (no framework), ported verbatim from the
  original app — same visual design throughout

## Quick start
```bash
npm install
cp .env.example .env.local   # fill in your real keys — see SETUP.md
npm run dev
```
Open http://localhost:3000.

## Documentation
| Doc | What's in it |
|---|---|
| [`SETUP.md`](./SETUP.md) | Full local dev setup: env vars, Supabase auth config, AI provider setup, Razorpay setup, troubleshooting |
| [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) | Step-by-step production deployment to Vercel |
| [`PRODUCTION_AUDIT.md`](./PRODUCTION_AUDIT.md) | Security, SEO, performance, and mobile-responsiveness audit findings for this release |
| [`MIGRATION.md`](./MIGRATION.md) | Full phase-by-phase migration history from the original single-file app |
| [`supabase/schema.sql`](./supabase/schema.sql) | Reference database schema (tables, indexes, RLS policies) |

## Project structure
```
app/                    Routes (App Router) — one folder per screen
  api/generate/          AI generation endpoint (auth + usage-gated)
  api/payments/          Razorpay order creation + verification
  tools/[id]/             Dynamic tool detail page (all 21 tools)
components/             Reusable UI components (modals, nav, etc.)
contexts/               Session (auth) and Toast providers
lib/
  ai/                     AI provider abstraction (Groq/OpenAI/Anthropic)
  razorpay/               Order creation + signature verification
  supabase/               Browser client, data layer, server auth helper
data/tools.ts           All 21 tool definitions (prompts, inputs, UI)
supabase/schema.sql     Reference DB schema
```

## Status
Feature-complete and production-ready. See `PRODUCTION_AUDIT.md` for the
Phase 6 hardening pass (security headers, auth-gated API routes, SEO,
error boundaries) applied before this release.
