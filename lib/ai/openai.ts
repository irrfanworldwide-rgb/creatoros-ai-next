import { AIProviderError, type AIProvider, type AIGenerateResult } from "./types";

export function createOpenAIProvider(): AIProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new AIProviderError(
      "OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server. See SETUP.md.",
      500
    );
  }

  return {
    async generate(prompt: string): Promise<AIGenerateResult> {
      let res: Response;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
          }),
        });
      } catch {
        throw new AIProviderError("Could not reach OpenAI. Check your network connection.", 502);
      }

      if (res.status === 401) {
        throw new AIProviderError("OpenAI rejected the API key (401). Check OPENAI_API_KEY in .env.local.", 500);
      }
      if (res.status === 429) {
        throw new AIProviderError("OpenAI rate limit or quota exceeded. Please try again shortly.", 429);
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new AIProviderError(`OpenAI API error (${res.status}): ${errText.slice(0, 300)}`, 502);
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      if (!content) {
        throw new AIProviderError("OpenAI returned an empty response. Please try again.", 502);
      }
      return { content };
    },
  };
}
