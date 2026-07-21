import type { SupabaseClient, User } from "@supabase/supabase-js";

export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired"
  | null;

export interface Profile {
  id: string;
  email: string | null;
  plan: "free" | "pro";
  razorpay_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_current_end: string | null;
  suspended: boolean;
}

export interface GenerationRecord {
  id: string;
  user_id: string;
  tool_id: string;
  tool_name: string;
  content: string;
  created_at: string;
}

const FREE_DAILY_LIMIT = 3;
export { FREE_DAILY_LIMIT };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Ensures a `profiles` row exists for this user (created on first
 * sign-in/sign-up in the original app). Returns the profile.
 */
export async function ensureProfile(sb: SupabaseClient, user: User): Promise<Profile> {
  const { data: existing } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (existing) return existing as Profile;

  const { data: created, error } = await sb
    .from("profiles")
    .insert({ id: user.id, email: user.email, plan: "free" })
    .select("*")
    .single();

  if (error) throw error;
  return created as Profile;
}

export async function loadPlan(sb: SupabaseClient, userId: string): Promise<"free" | "pro"> {
  const { data } = await sb.from("profiles").select("plan").eq("id", userId).maybeSingle();
  return (data?.plan as "free" | "pro") || "free";
}

/** Returns how many generations this user has used today. */
export async function getTodayUsage(sb: SupabaseClient, userId: string): Promise<number> {
  const { data } = await sb
    .from("daily_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("date", todayStr())
    .maybeSingle();
  return data?.count ?? 0;
}

/** Increments (or creates) today's usage row for this user. */
export async function incUsage(sb: SupabaseClient, userId: string): Promise<number> {
  const date = todayStr();
  const { data: existing } = await sb
    .from("daily_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  const next = (existing?.count ?? 0) + 1;

  const { error } = await sb
    .from("daily_usage")
    .upsert({ user_id: userId, date, count: next }, { onConflict: "user_id,date" });

  if (error) throw error;
  return next;
}

/** Same gating rule as the original app: Pro = unlimited, Free = 3/day. */
export function canGenerate(plan: "free" | "pro", usageToday: number): boolean {
  return plan === "pro" || usageToday < FREE_DAILY_LIMIT;
}

export async function saveGeneration(
  sb: SupabaseClient,
  userId: string,
  toolId: string,
  toolName: string,
  content: string
): Promise<void> {
  const { error } = await sb.from("generations").insert({
    user_id: userId,
    tool_id: toolId,
    tool_name: toolName,
    content,
  });
  if (error) throw error;
}

export async function getGenerations(sb: SupabaseClient, userId: string): Promise<GenerationRecord[]> {
  const { data, error } = await sb
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as GenerationRecord[]) || [];
}

export async function deleteGeneration(sb: SupabaseClient, id: string): Promise<void> {
  const { error } = await sb.from("generations").delete().eq("id", id);
  if (error) throw error;
}
