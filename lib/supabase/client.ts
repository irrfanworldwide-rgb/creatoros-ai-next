import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Ported verbatim from the original inline <script> config in index.html.
// Same project, same public/publishable key, same auth options (implicit
// flow + localStorage session persistence) — no behavior change.
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let browserClient: SupabaseClient | undefined;

/**
 * Non-throwing check for missing config, used by SessionContext to fail
 * gracefully (a friendly config-error screen) instead of throwing during
 * render/effect, which previously escalated all the way to the root
 * app/global-error.tsx boundary and showed a generic, unhelpful crash
 * screen on every single page. Returns the list of missing var names,
 * empty if everything required is present.
 */
export function getMissingSupabaseEnvVars(): string[] {
  const missing: string[] = [];
  if (!SB_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SB_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return missing;
}

/**
 * Returns a singleton Supabase client for use in Client Components.
 * Mirrors the original app's single global `sb` instance.
 *
 * Only call this after confirming getMissingSupabaseEnvVars() is empty —
 * callers that skip that check will still get a clear thrown error rather
 * than a silent `createClient(undefined, undefined)` failure, but letting
 * it throw here is a last resort, not the primary safeguard anymore.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    if (!SB_URL || !SB_KEY) {
      throw new Error(
        "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY are set — in .env.local for local dev, or in your " +
          "hosting provider's Environment Variables settings for a deployment (then redeploy — " +
          "NEXT_PUBLIC_ vars are baked in at build time, so adding them alone isn't enough). " +
          "See SETUP.md / DEPLOYMENT_CHECKLIST.md."
      );
    }
    browserClient = createClient(SB_URL, SB_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    });
  }
  return browserClient;
}
