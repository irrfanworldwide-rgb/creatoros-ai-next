import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Ported verbatim from the original inline <script> config in index.html.
// Same project, same public/publishable key, same auth options (implicit
// flow + localStorage session persistence) — no behavior change.
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

let browserClient: SupabaseClient | undefined;

/**
 * Returns a singleton Supabase client for use in Client Components.
 * Mirrors the original app's single global `sb` instance.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    if (!SB_URL || !SB_KEY) {
      throw new Error(
        "Missing Supabase environment variables. Ensure a .env.local file exists at the project " +
          "root with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set, then restart " +
          "`npm run dev` (Next.js only loads env files at server start). See SETUP.md."
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
