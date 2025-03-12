import { BaseAgent } from "../core/BaseAgent";
import type { Customer, Order } from "@/types/schema";

export class CustomerServiceAgent extends BaseAgent {
  constructor() {
    super({
      name: "customer-service-agent",
      description:
        "AI agent for customer support and satisfaction optimization",
    });
  }

  async handleInquiry(inquiry: string, customer: Customer) {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are a customer service specialist. Provide helpful and professional responses.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({ inquiry, customer }),
      },
    ];
    return JSON.parse((await this.chat(messages)) || "{}");
  }

  async analyzeSatisfaction(customer: Customer, orders: Order[]) {
    const messages = [
      {
        role: "system" as const,
        content:
          "You are a customer satisfaction analyst. Evaluate customer experience and suggest improvements.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({ customer, orders }),
      },
    ];
    return JSON.parse((await this.chat(messages)) || "{}");
  }
}
