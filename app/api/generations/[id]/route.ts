import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: "Invalid generation id." }, { status: 400 });
  }

  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const sb = getUserScopedClient(token);
  const { data, error } = await sb
    .from("generations")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Could not delete generation:", error.message);
    return NextResponse.json({ error: "Could not delete. Please try again." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Saved generation not found." }, { status: 404 });

  return NextResponse.json({ success: true });
}
