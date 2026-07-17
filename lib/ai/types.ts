export interface AIGenerateResult {
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
  generate(prompt: string): Promise<AIGenerateResult>;
}
