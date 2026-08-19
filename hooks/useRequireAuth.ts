"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";

/**
 * Redirects to "/" if the user isn't logged in, or to "/verify-email" if
 * they're logged in but haven't confirmed their email yet, once the
 * session has loaded. Protects every page that calls this hook — do not
 * rely on this alone for anything security-sensitive server-side (see
 * lib/supabase/serverAuth.ts for the equivalent API-layer check).
 */
export function useRequireAuth() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!user.email_confirmed_at) {
      router.replace(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
    }
  }, [loading, user, router]);

  return { user, loading };
}
