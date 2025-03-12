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
      // For testing purposes, return mock data instead of making actual API calls
      // This allows the system to work without an actual OpenAI API key
      console.log(
        `Agent ${this.config.name} processing:`,
        messages[messages.length - 1].content,
      );

      // Return a mock response based on the agent type and message content
      const mockResponse = this.generateMockResponse(messages);
      return mockResponse;
    } catch (error) {
      console.error(`Agent ${this.config.name} chat error:`, error);
      throw error;
    }
  }

  private generateMockResponse(
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  ): string {
    const lastMessage = messages[messages.length - 1].content as string;
    const agentType = this.config.name;

    // Create different mock responses based on agent type
    if (agentType.includes("product")) {
      return JSON.stringify({
        recommendedPrice: 79.99,
        pricingStrategy: "Premium pricing with occasional promotions",
        competitiveAnalysis: "Product is positioned well against competitors",
        optimizedTitle:
          "Premium Wireless Earbuds with Active Noise Cancellation",
        optimizedDescription:
          "Experience crystal-clear sound with our advanced noise cancellation technology.",
      });
    } else if (agentType.includes("supplier")) {
      return JSON.stringify({
        supplierRating: 4.7,
        reliabilityScore: 0.92,
        recommendedActions: [
          "Negotiate better shipping rates",
          "Increase order volume for better pricing",
        ],
        alternativeSuppliers: ["SupplierX", "SupplierY"],
        riskAssessment: "Low risk supplier with consistent delivery times",
      });
    } else if (agentType.includes("marketing")) {
      return JSON.stringify({
        targetAudience: "Tech-savvy professionals, 25-45 years old",
        marketingChannels: ["Instagram", "Facebook", "Google Ads"],
        campaignIdeas: ["30-day challenge", "Influencer partnerships"],
        conversionOptimization: "Add social proof and limited-time offers",
      });
    } else if (agentType.includes("inventory")) {
      return JSON.stringify({
        forecastDemand: 250,
        reorderPoint: 50,
        optimalStockLevel: 150,
        seasonalityFactor: 1.3,
        daysUntilReorder: 14,
        stockoutRisk: "Low",
      });
    } else if (agentType.includes("customer")) {
      return JSON.stringify({
        responseTemplate:
          "Thank you for your inquiry. Your order #{{order_id}} is currently {{status}} and expected to arrive by {{delivery_date}}.",
        sentimentAnalysis: "Positive",
        recommendedActions: [
          "Send follow-up email",
          "Offer discount on next purchase",
        ],
        customerLifetimeValue: "High",
      });
    } else {
      // Default response for manager or unknown agent types
      return JSON.stringify({
        recommendation:
          "Based on department insights, proceed with the proposed strategy",
        confidenceScore: 0.85,
        nextSteps: [
          "Implement pricing changes",
          "Update marketing strategy",
          "Monitor inventory levels",
        ],
        expectedOutcome: "15% increase in sales with 5% higher margins",
      });
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
