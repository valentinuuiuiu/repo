import { BaseAgent } from "../core/BaseAgent";
import type { Supplier, Order } from "@/types/schema";

export class SupplierAgent extends BaseAgent {
  constructor() {
    super({
      name: "supplier-agent",
      description:
        "AI agent for supplier analysis, performance monitoring and optimization",
    });
  }

  async analyzePerformance(supplier: Supplier, orders: Order[]) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a supplier performance analyst. Evaluate the supplier's performance metrics and provide insights.
                 Consider: fulfillment speed, quality scores, communication, reliability, and overall value.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          supplier: {
            name: supplier.name,
            rating: supplier.rating,
            fulfillmentSpeed: supplier.fulfillmentSpeed,
            qualityScore: supplier.qualityScore,
            communicationScore: supplier.communicationScore,
          },
          orders: orders.map((order) => ({
            id: order.id,
            status: order.status,
            fulfillmentStatus: order.fulfillmentStatus,
            createdAt: order.createdAt,
          })),
        }),
      },
    ];

    const response = await this.chat(messages);
    return JSON.parse(response || "{}");
  }

  async predictReliability(supplier: Supplier, orders: Order[]) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a supplier reliability predictor. Analyze historical data and predict future performance.
                 Consider: order history, consistency, seasonal patterns, and risk factors.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          supplier: {
            name: supplier.name,
            rating: supplier.rating,
            status: supplier.status,
          },
          orderHistory: orders.map((order) => ({
            date: order.createdAt,
            status: order.status,
            fulfillmentStatus: order.fulfillmentStatus,
          })),
        }),
      },
    ];

    const response = await this.chat(messages);
    return JSON.parse(response || "{}");
  }

  async suggestImprovements(supplier: Supplier) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a supplier optimization specialist. Suggest areas for improvement and specific actions.
                 Consider: current performance metrics, industry standards, and best practices.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          name: supplier.name,
          metrics: {
            rating: supplier.rating,
            fulfillmentSpeed: supplier.fulfillmentSpeed,
            qualityScore: supplier.qualityScore,
            communicationScore: supplier.communicationScore,
          },
        }),
      },
    ];

    const response = await this.chat(messages);
    return JSON.parse(response || "{}");
  }
}
