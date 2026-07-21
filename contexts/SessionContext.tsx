"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, getMissingSupabaseEnvVars } from "@/lib/supabase/client";
import { ensureProfile, getTodayUsage, type Profile } from "@/lib/supabase/data";
import ConfigError from "@/components/ConfigError";

interface SessionContextValue {
  user: User | null;
  profile: Profile | null;
  usageToday: number;
  loading: boolean;
  refreshUsage: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usageToday, setUsageToday] = useState(0);
  const [loading, setLoading] = useState(true);

  // Computed once per render, not stateful — this is a pure env check, so
  // it's safe to call directly rather than stashing in useState/useEffect.
  const missingEnvVars = getMissingSupabaseEnvVars();

  const loadForUser = useCallback(async (u: User) => {
    const sb = getSupabaseBrowserClient();
    const [p, usage] = await Promise.all([ensureProfile(sb, u), getTodayUsage(sb, u.id)]);
    if (p.suspended) {
      try {
        sessionStorage.setItem("creatoros_suspended", "1");
      } catch {
        // non-critical
      }
      await sb.auth.signOut();
      setProfile(null);
      setUser(null);
      setUsageToday(0);
      return;
    }
    setProfile(p);
    setUsageToday(usage);
  }, []);

  useEffect(() => {
    // Config is broken — don't attempt any Supabase calls. The provider
    // renders <ConfigError> below instead of {children}, so this effect
    // doing nothing further is fine; nothing downstream will render.
    if (missingEnvVars.length > 0) {
      setLoading(false);
      return;
    }

    let unsubscribed = false;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    (async () => {
      try {
        const sb = getSupabaseBrowserClient();

        const {
          data: { session },
        } = await sb.auth.getSession();
        if (unsubscribed) return;
        setUser(session?.user ?? null);
        if (session?.user) await loadForUser(session.user);
        setLoading(false);

        const { data: listener } = sb.auth.onAuthStateChange(async (_event, newSession) => {
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await loadForUser(newSession.user);
          } else {
            setProfile(null);
            setUsageToday(0);
          }
        });
        if (unsubscribed) {
          listener.subscription.unsubscribe();
        } else {
          authListener = listener;
        }
      } catch (err) {
        // A real Supabase config/network problem (bad URL, project paused,
        // etc.) shouldn't crash the whole app — degrade to "logged out"
        // and let the user retry, same as if they simply weren't signed in.
        // eslint-disable-next-line no-console
        console.error("Session initialization failed:", err);
        if (!unsubscribed) setLoading(false);
      }
    })();

    return () => {
      unsubscribed = true;
      authListener?.subscription.unsubscribe();
    };
  }, [loadForUser, missingEnvVars.length]);

  const refreshUsage = useCallback(async () => {
    if (!user) return;
    const sb = getSupabaseBrowserClient();
    setUsageToday(await getTodayUsage(sb, user.id));
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadForUser(user);
  }, [user, loadForUser]);

  const signOut = useCallback(async () => {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
  }, []);

  if (missingEnvVars.length > 0) {
    return <ConfigError missing={missingEnvVars} />;
  }

  return (
    <SessionContext.Provider value={{ user, profile, usageToday, loading, refreshUsage, refreshProfile, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
