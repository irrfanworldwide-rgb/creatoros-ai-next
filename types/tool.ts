export type ToolInputType = "input" | "textarea" | "select";

export interface ToolInput {
  id: string;
  label: string;
  type: ToolInputType;
  placeholder?: string;
  rows?: number;
  options?: string[];
}

export interface ToolValues {
  [key: string]: string;
}

export interface Tool {
  id: string;
  icon: string;
  name: string;
  desc: string;
  badge?: string;
  cat: string;
  inputs: ToolInput[];
  /** Builds the AI prompt from user-entered values — identical templates to the original app. */
  prompt: (v: ToolValues) => string;
}
