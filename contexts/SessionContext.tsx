"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureProfile, getTodayUsage, type Profile } from "@/lib/supabase/data";

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

  const loadForUser = useCallback(async (u: User) => {
    const sb = getSupabaseBrowserClient();
    const [p, usage] = await Promise.all([ensureProfile(sb, u), getTodayUsage(sb, u.id)]);
    setProfile(p);
    setUsageToday(usage);
  }, []);

  useEffect(() => {
    const sb = getSupabaseBrowserClient();

    sb.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadForUser(session.user);
      setLoading(false);
    });

    const { data: listener } = sb.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadForUser(session.user);
      } else {
        setProfile(null);
        setUsageToday(0);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadForUser]);

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
