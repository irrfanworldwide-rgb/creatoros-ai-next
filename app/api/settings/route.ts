import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/serviceClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = getSupabaseServiceClient();
    const { data } = await sb.from("settings").select("value").eq("key", "maintenance_mode").maybeSingle();
    return NextResponse.json({ maintenanceMode: data?.value === true });
  } catch {
    // If settings can't be read for any reason, fail OPEN (site stays up)
    // rather than accidentally locking everyone out.
    return NextResponse.json({ maintenanceMode: false });
  }
}
