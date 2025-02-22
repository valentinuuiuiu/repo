import { BaseAgent } from "../core/BaseAgent";
import type { Product, Order, Supplier } from "@/types/schema";
import type { AgentResponse } from "../types";

export class InventoryAgent extends BaseAgent {
  constructor() {
    super({
      name: "inventory-agent",
      description: "AI agent for inventory management and optimization"
    });
  }

  async predictDemand(product: Product, historicalData: any): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: "You are an inventory demand forecasting specialist."
      },
      {
        role: "user" as const,
        content: JSON.stringify({ product, historicalData })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const forecast = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: forecast,
        metadata: {
          confidence: 0.75,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async optimizeStockLevels(products: Product[]): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: "You are an inventory optimization specialist. Suggest optimal stock levels."
      },
      {
        role: "user" as const,
        content: JSON.stringify({ products })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const optimization = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: optimization,
        metadata: {
          confidence: 0.8,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async forecastDemand(product: Product, historicalData: any) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a demand forecasting specialist for dropshipping. Predict product demand and suggest inventory strategies.
                 Consider: historical sales, seasonal trends, marketing campaigns, and supplier lead times.
                 Provide specific demand forecasts and inventory recommendations.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ product, historicalData })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async optimizeOrderRouting(orders: Order[], suppliers: Supplier[]) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an order routing specialist for dropshipping. Optimize order allocation across suppliers.
                 Consider: supplier locations, shipping costs, delivery times, and order priorities.
                 Suggest optimal routing strategies for each order.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ orders, suppliers })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async manageStockouts(product: Product, suppliers: Supplier[]) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a stockout management specialist. Handle product unavailability situations.
                 Consider: alternative suppliers, customer communication, and listing updates.
                 Provide specific action plans for different stockout scenarios.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ product, suppliers })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async optimizeFulfillment(orders: Order[]) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a fulfillment optimization specialist for dropshipping. Improve order fulfillment efficiency.
                 Consider: processing times, error rates, customer satisfaction, and cost optimization.
                 Provide specific recommendations for fulfillment process improvement.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ orders })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }
}
