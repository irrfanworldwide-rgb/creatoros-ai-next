import { NextRequest, NextResponse } from "next/server";
import { TOOLS } from "@/data/tools";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";

export const dynamic = "force-dynamic";

const MAX_GENERATION_CONTENT_LENGTH = 50_000;

async function getAuthenticatedClient(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) return null;

  const user = await getUserFromToken(token);
  if (!user) return null;

  return { user, sb: getUserScopedClient(token) };
}

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedClient(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data, error } = await auth.sb
    .from("generations")
    .select("id, user_id, tool_id, tool_name, content, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Could not load generations:", error.message);
    return NextResponse.json({ error: "Could not load your Library. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ generations: data || [] });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedClient(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { toolId?: string; content?: string };
  try {
    body = (await req.json()) as { toolId?: string; content?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const tool = TOOLS.find((candidate) => candidate.id === body.toolId);
  const content = body.content?.trim();
  if (!tool || !content) {
    return NextResponse.json({ error: "A valid tool and generated content are required." }, { status: 400 });
  }
  if (content.length > MAX_GENERATION_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Generated content is too long to save." }, { status: 400 });
  }

  const { data, error } = await auth.sb
    .from("generations")
    .insert({ user_id: auth.user.id, tool_id: tool.id, tool_name: tool.name, content })
    .select("id, user_id, tool_id, tool_name, content, created_at")
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Could not save generation:", error.message);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ generation: data }, { status: 201 });
}
