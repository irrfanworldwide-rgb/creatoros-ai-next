import { AIProviderError, type AIProvider, type AIGenerateResult } from "./types";
import { CREATOROS_SYSTEM_PROMPT } from "./systemPrompt";
import { sanitizeAIResponse } from "./sanitize";

export function createGroqProvider(): AIProvider {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new AIProviderError(
      "GROQ_API_KEY is not set. Add it to .env.local and restart the dev server. See SETUP.md.",
      500
    );
  }

  return {
    async generate(prompt: string): Promise<AIGenerateResult> {
      let res: Response;
      try {
        // Groq exposes an OpenAI-compatible endpoint, so the request/response
        // shape matches the OpenAI provider exactly.
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: CREATOROS_SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
          }),
        });
      } catch {
        throw new AIProviderError("Could not reach Groq. Check your network connection.", 502);
      }

      if (res.status === 401) {
        throw new AIProviderError("Groq rejected the API key (401). Check GROQ_API_KEY in .env.local.", 500);
      }
      if (res.status === 429) {
        throw new AIProviderError("Groq rate limit or quota exceeded. Please try again shortly.", 429);
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new AIProviderError(`Groq API error (${res.status}): ${errText.slice(0, 300)}`, 502);
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      if (!content) {
        throw new AIProviderError("Groq returned an empty response. Please try again.", 502);
      }
      return { content: sanitizeAIResponse(content) };
    },
  };
}
