import { BaseAgent } from "../core/BaseAgent";
import type { Product } from "@/types/schema";

export class InventoryAgent extends BaseAgent {
  constructor() {
    super({
      name: "inventory-agent",
      description: "AI agent for inventory management and optimization",
    });
  }

  async predictDemand(product: Product, historicalData: any) {
    const messages = [
      {
        role: "system" as const,
        content: "You are an inventory demand forecasting specialist.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({ product, historicalData }),
      },
    ];
    return JSON.parse((await this.chat(messages)) || "{}");
  }

  async optimizeStockLevels(products: Product[]) {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are an inventory optimization specialist. Suggest optimal stock levels.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({ products }),
      },
    ];
    return JSON.parse((await this.chat(messages)) || "{}");
  }
}
