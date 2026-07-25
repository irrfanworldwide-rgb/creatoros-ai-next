import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, AIProviderError } from "@/lib/ai";
import { getBearerToken, getUserFromToken, getUserScopedClient } from "@/lib/supabase/serverAuth";
import { canGenerate, getTodayUsage, incUsage, getFreeDailyLimit } from "@/lib/supabase/data";

// Never cache these endpoints — every request is user-specific and
// security-sensitive (AI generation usage, payment verification).
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // --- Auth: reject unauthenticated requests outright ---
  const token = getBearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let prompt: string | undefined;
  try {
    const body = (await req.json()) as { prompt?: string };
    prompt = body.prompt;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!prompt || !prompt.trim()) {
    return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
  }
  // Reasonable upper bound so a single request can't be used to run up a
  // huge provider bill via an oversized prompt.
  if (prompt.length > 8000) {
    return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
  }

  // --- Server-side usage gate: the real enforcement point ---
  // sb is scoped to this user's own access token, so these reads/writes
  // go through the same RLS policies a normal client request would.
  const sb = getUserScopedClient(token);

  const { data: profile } = await sb.from("profiles").select("plan").eq("id", user.id).maybeSingle();
  const plan = (profile?.plan as "free" | "pro") || "free";
  const usageToday = await getTodayUsage(sb, user.id);
  const dailyLimit = await getFreeDailyLimit(sb);

  if (!canGenerate(plan, usageToday, dailyLimit)) {
    return NextResponse.json(
      { error: "Daily free-tier limit reached. Upgrade to Pro for unlimited generations." },
      { status: 403 }
    );
  }

  try {
    const provider = getAIProvider();
    const { content } = await provider.generate(prompt);

    // Only count usage on a successful generation — a failed provider
    // call shouldn't cost the user one of their daily generations.
    const newUsageToday = await incUsage(sb, user.id);

    return NextResponse.json({ content, usageToday: newUsageToday });
  } catch (err) {
    if (err instanceof AIProviderError) {
      // The detailed message (which may name the underlying provider,
      // e.g. "Groq rejected the API key") is logged server-side only —
      // never sent to the client. The user always sees generic,
      // CreatorOS AI-branded copy, regardless of which provider is
      // configured behind the scenes.
      // eslint-disable-next-line no-console
      console.error("AI generation provider error:", err.message);
      const clientMessage =
        err.status === 429
          ? "You're sending requests too quickly. Please wait a moment and try again."
          : "CreatorOS AI is temporarily unavailable. Please try again in a moment.";
      return NextResponse.json({ error: clientMessage }, { status: err.status });
    }
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
