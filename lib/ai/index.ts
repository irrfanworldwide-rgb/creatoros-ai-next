import type { AIProvider } from "./types";
import { createOpenAIProvider } from "./openai";
import { createAnthropicProvider } from "./anthropic";
import { createGroqProvider } from "./groq";

/**
 * Every CreatorOS AI tool (script writer, hook generator, captions,
 * hashtags, CTAs, etc.) already builds its full prompt client-side via
 * tool.prompt(values) in data/tools.ts — this layer just needs to execute
 * whatever prompt it's given, so no per-tool changes are needed here.
 *
 * Set AI_PROVIDER in .env.local to "groq" (default — matches the live
 * app), "openai", or "anthropic".
 */
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  switch (provider) {
    case "groq":
      return createGroqProvider();
    case "anthropic":
      return createAnthropicProvider();
    case "openai":
      return createOpenAIProvider();
    default:
      throw new Error(`Unknown AI_PROVIDER "${provider}". Use "groq", "openai", or "anthropic" in .env.local.`);
  }
}

export { AIProviderError } from "./types";
