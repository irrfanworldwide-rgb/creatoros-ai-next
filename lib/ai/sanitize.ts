// Ordered roughly longest-match-first so multi-word brand names get
// replaced before any shorter substring within them would match.
const PROVIDER_PATTERNS: RegExp[] = [
  /\bMeta\s?AI\b/gi,
  /\bMeta\s?Llama\b/gi,
  /\bOpen\s?AI\b/gi,
  /\bChatGPT\b/gi,
  /\bGPT-?4o?\b/gi,
  /\bGPT-?3(\.5)?\b/gi,
  /\bAnthropic\b/gi,
  /\bClaude(\s?(Sonnet|Opus|Haiku|Instant))?\b/gi,
  /\bGoogle\s?Gemini\b/gi,
  /\bGemini(\s?(Pro|Ultra|Nano|Flash))?\b/gi,
  /\bGroq\b/gi,
  /\bMixtral\b/gi,
  /\bLLaMA(\s?[\d.]+)?\b/gi,
  /\bLlama(\s?[\d.]+)?\b/gi,
];

export function sanitizeAIResponse(text: string): string {
  let result = text;
  for (const pattern of PROVIDER_PATTERNS) {
    result = result.replace(pattern, "CreatorOS AI");
  }
  // Collapse any "CreatorOS AI CreatorOS AI"-style duplication left behind
  // by adjacent replacements (e.g. "Meta Llama 3" -> two matches in a row).
  result = result.replace(/(CreatorOS AI[\s,]*){2,}/gi, "CreatorOS AI ");
  return result;
}
