import { BaseAgent } from "../core/BaseAgent";
import type { Product } from "@/types/schema";

export class MarketingAgent extends BaseAgent {
  constructor() {
    super({
      name: "marketing-agent",
      description: "AI agent for marketing strategy and campaign optimization",
    });
  }

  async createMarketingStrategy(product: Product) {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are a marketing strategist. Create comprehensive marketing strategies for products.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          product,
          request:
            "Create a marketing strategy including target audience, channels, and key messages.",
        }),
      },
    ];
    return JSON.parse((await this.chat(messages)) || "{}");
  }

  async optimizeAds(product: Product, currentPerformance: any) {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are an advertising optimization specialist. Analyze ad performance and suggest improvements.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({ product, currentPerformance }),
      },
    ];
    return JSON.parse((await this.chat(messages)) || "{}");
  }
}
