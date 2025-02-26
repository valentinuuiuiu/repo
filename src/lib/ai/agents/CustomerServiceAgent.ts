import { BaseAgent } from "../core/BaseAgent";
import type { Customer, Order, Product } from "@/types/schema";
import type { AgentResponse } from "../types";

export class CustomerServiceAgent extends BaseAgent {
  constructor() {
    super({
      name: "customer-service-agent",
      description: "AI agent for customer support and satisfaction optimization"
    });
  }

  async handleInquiry(inquiry: string, customer: Customer): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: "You are a customer service specialist. Provide helpful and professional responses."
      },
      {
        role: "user" as const,
        content: JSON.stringify({ inquiry, customer })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const answer = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: answer,
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return this.handleError(error);
      }
      return this.handleError(new Error(String(error)));
    }
  }

  async analyzeSatisfaction(customer: Customer, orders: Order[]): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: "You are a customer satisfaction analyst. Evaluate customer experience and suggest improvements."
      },
      {
        role: "user" as const,
        content: JSON.stringify({ customer, orders })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: analysis,
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return this.handleError(error);
      }
      return this.handleError(new Error(String(error)));
    }
  }

  async handleShippingInquiry(order: Order, customer: Customer): Promise<AgentResponse> {
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

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const answer = JSON.parse(response || '{}');
      
      return {
        success: true,
        data: answer,
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async handleReturnRequest(order: Order, reason: string): Promise<AgentResponse> {
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

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const answer = JSON.parse(response || '{}');
      
      return {
        success: true,
        data: answer,
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateCustomerFAQ(products: Product[]): Promise<AgentResponse> {
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

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const answer = JSON.parse(response || '{}');
      
      return {
        success: true,
        data: answer,
        metadata: {
          confidence: 0.9,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        return this.handleError(error);
      }
      return this.handleError(new Error(String(error)));
    }
  }

  async analyzeCustomerFeedback(reviews: any[], orders: Order[]): Promise<AgentResponse> {
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

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const answer = JSON.parse(response || '{}');
      
      return {
        success: true,
        data: answer,
        metadata: {
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
