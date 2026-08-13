import { AIProviderError, type AIProvider, type AIGenerateResult, type AIMessage } from "./types";
import { CREATOROS_SYSTEM_PROMPT } from "./systemPrompt";
import { sanitizeAIResponse } from "./sanitize";

const MAX_HISTORY_MESSAGES = 10;

export function createAnthropicProvider(): AIProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

  if (!apiKey) {
    throw new AIProviderError(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server. See SETUP.md.",
      500
    );
  }

  return {
    async generate(prompt: string, history?: AIMessage[]): Promise<AIGenerateResult> {
      let res: Response;
      try {
        const historyMessages = (history || []).slice(-MAX_HISTORY_MESSAGES);
        res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model,
            max_tokens: 1500,
            system: CREATOROS_SYSTEM_PROMPT,
            messages: [...historyMessages, { role: "user", content: prompt }],
          }),
        });
      } catch {
        throw new AIProviderError("Could not reach Anthropic. Check your network connection.", 502);
      }

      if (res.status === 401) {
        throw new AIProviderError("Anthropic rejected the API key (401). Check ANTHROPIC_API_KEY in .env.local.", 500);
      }
      if (res.status === 429) {
        throw new AIProviderError("Anthropic rate limit or quota exceeded. Please try again shortly.", 429);
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new AIProviderError(`Anthropic API error (${res.status}): ${errText.slice(0, 300)}`, 502);
      }

      const data = await res.json();
      const content: string = data?.content?.[0]?.text ?? "";
      if (!content) {
        throw new AIProviderError("Anthropic returned an empty response. Please try again.", 502);
      }
      return { content: sanitizeAIResponse(content) };
    },
  };
}
