export interface AIGenerateResult {
  content: string;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export class AIProviderError extends Error {
  /** HTTP status to surface to the client (502 for provider errors, 500 for config errors). */
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AIProviderError";
  }
}

export interface AIProvider {
  /**
   * `history` is optional prior conversation turns (Chat only — the 21
   * content tools never pass it, since each of their prompts is a
   * complete, self-contained request). When present, it's placed before
   * the current `prompt` so the model can resolve references like "make
   * it shorter" or "same but professional".
   */
  generate(prompt: string, history?: AIMessage[]): Promise<AIGenerateResult>;
}
