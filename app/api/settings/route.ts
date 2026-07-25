import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

const DEFAULT_FREE_DAILY_LIMIT = 3;

export async function GET() {
  try {
    const sb = getSupabaseServiceClient();
    const { data } = await sb.from("settings").select("key, value").in("key", ["maintenance_mode", "free_daily_limit"]);
    const maintenanceMode = data?.find((r) => r.key === "maintenance_mode")?.value === true;
    const limitValue = data?.find((r) => r.key === "free_daily_limit")?.value;
    const freeDailyLimit = typeof limitValue === "number" && limitValue > 0 ? limitValue : DEFAULT_FREE_DAILY_LIMIT;
    return NextResponse.json({ maintenanceMode, freeDailyLimit });
  } catch {
    // If settings can't be read for any reason, fail OPEN (site stays up)
    // rather than accidentally locking everyone out, and fall back to
    // the default limit rather than erroring.
    return NextResponse.json({ maintenanceMode: false, freeDailyLimit: DEFAULT_FREE_DAILY_LIMIT });
  }
}
