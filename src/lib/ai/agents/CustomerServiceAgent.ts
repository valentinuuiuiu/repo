import { BaseAgent } from "../core/BaseAgent";
import type { Customer, Order } from "@/types/schema";

export class CustomerServiceAgent extends BaseAgent {
  constructor() {
    super({
      name: 'customer-service-agent',
      description: 'AI agent for dropshipping customer service and satisfaction'
    });
  }

  async handleShippingInquiry(order: Order, customer: Customer) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a shipping support specialist for dropshipping. Handle shipping-related customer inquiries.
                 Consider: tracking information, delivery estimates, and shipping delays.
                 Provide clear and helpful responses with specific actions.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ order, customer })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async handleReturnRequest(order: Order, reason: string) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a returns management specialist for dropshipping. Process and evaluate return requests.
                 Consider: return policies, shipping costs, and supplier agreements.
                 Provide specific return instructions and resolution options.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ order, reason })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async generateCustomerFAQ(products: Product[]) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a customer support content specialist. Create comprehensive FAQ content.
                 Consider: common shipping questions, return policies, and product-specific inquiries.
                 Provide clear and detailed answers for each FAQ item.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ products })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async analyzeCustomerFeedback(reviews: any[], orders: Order[]) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a customer feedback analyst for dropshipping. Analyze customer reviews and satisfaction metrics.
                 Consider: product quality, shipping times, customer service, and overall satisfaction.
                 Provide specific insights and improvement recommendations.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ reviews, orders })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }
} {
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
