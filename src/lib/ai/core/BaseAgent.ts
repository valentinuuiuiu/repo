import OpenAI from "openai";

export interface AgentConfig {
  name: string;
  description: string;
}

export abstract class BaseAgent {
  protected openai: OpenAI;
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  protected async chat(
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  ) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Agent ${this.config.name} chat error:`, error);
      throw error;
    }
  }

  getStatus() {
    return {
      name: this.config.name,
      description: this.config.description,
      status: "active",
    };
  }
}
