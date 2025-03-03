export enum AgentCategory {
  ASSISTANT = "assistant",
  FUNCTION = "function",
  TOOL = "tool",
}

export enum AgentRole {
  USER = "user",
  SYSTEM = "system",
  ASSISTANT = "assistant",
  FUNCTION = "function",
  TOOL = "tool",
}

export interface Agent {
  id: string;
  name: string;
  category: AgentCategory;
  role: AgentRole;
  description: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  tools?: string[];
}