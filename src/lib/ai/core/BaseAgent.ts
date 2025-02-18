import OpenAI from "openai";
import { AgentConfig } from "../types";

export abstract class BaseAgent {
  protected openai: OpenAI;
  protected config: AgentConfig;
  protected memory: Map<string, any> = new Map();
  protected subordinates: Map<string, BaseAgent> = new Map();

  constructor(config: AgentConfig) {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });
    this.config = config;
  }

  protected async think(input: any, context?: any) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are ${this.config.role} with expertise in ${this.config.expertise.join(", ")}. ${this.config.instructions}`,
          },
          {
            role: "user",
            content: `Task: ${JSON.stringify(input)}\nContext: ${JSON.stringify(context)}`,
          },
        ],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens,
      });

      return response.choices[0]?.message?.content;
    } catch (error) {
      console.error(`Agent ${this.config.id} thinking error:`, error);
      throw error;
    }
  }

  protected async delegate(task: any, targetAgent: string) {
    const agent = this.subordinates.get(targetAgent);
    if (!agent) throw new Error(`Subordinate agent ${targetAgent} not found`);
    return agent.execute(task);
  }

  protected async remember(key: string, value: any) {
    this.memory.set(key, {
      value,
      timestamp: new Date().toISOString(),
    });
  }

  protected recall(key: string) {
    return this.memory.get(key)?.value;
  }

  addSubordinate(id: string, agent: BaseAgent) {
    this.subordinates.set(id, agent);
  }

  abstract execute(task: any): Promise<any>;
}
