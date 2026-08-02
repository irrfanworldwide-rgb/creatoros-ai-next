import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export type GenerationBlockReason = "maintenance" | "suspended" | "limit" | "profile_missing" | null;

export interface GenerationReservation {
  allowed: boolean;
  usageToday: number;
  plan: "free" | "pro";
  freeDailyLimit: number;
  reason: GenerationBlockReason;
}

interface GenerationReservationRow {
  allowed: boolean;
  usage_today: number;
  plan: "free" | "pro";
  free_daily_limit: number;
  reason: GenerationBlockReason;
}

/**
 * Atomically checks site/user access and consumes one generation slot.
 * The SQL function is intentionally service-role-only so a browser client
 * cannot change its own usage or bypass the configured limit.
 */
export async function reserveGeneration(userId: string): Promise<GenerationReservation> {
  const sb = getSupabaseServiceClient();
  const { data, error } = await sb
    .rpc("reserve_generation", { p_user_id: userId })
    .maybeSingle<GenerationReservationRow>();

  if (error) throw error;
  if (!data) throw new Error("Generation reservation returned no result.");

  return {
    allowed: data.allowed === true,
    usageToday: Number.isFinite(data.usage_today) ? data.usage_today : 0,
    plan: data.plan === "pro" ? "pro" : "free",
    freeDailyLimit: Number.isFinite(data.free_daily_limit) ? data.free_daily_limit : 3,
    reason: data.reason || null,
  };
}

/** Releases a slot reserved for an AI request that did not complete. */
export async function releaseGenerationReservation(userId: string): Promise<void> {
  const sb = getSupabaseServiceClient();
  const { error } = await sb.rpc("release_generation_reservation", { p_user_id: userId });
  if (error) throw error;
}
