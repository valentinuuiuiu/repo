import OpenAI from "openai";

export interface AgentConfig {
  name: string;
  description: string;
}

export abstract class BaseAgent {
  protected openai: OpenAI;
  protected config: AgentConfig;
  private useMockResponses: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    // Check if we should use mock responses (when API key is not valid)
    this.useMockResponses =
      !import.meta.env.VITE_OPENAI_API_KEY ||
      import.meta.env.VITE_OPENAI_API_KEY.includes("XXXXX");
  }

  protected async chat(
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  ) {
    try {
      console.log(`Agent ${this.config.name} processing request...`);

      // Use real API if we have a valid key, otherwise use mock responses
      if (!this.useMockResponses) {
        const response = await this.openai.chat.completions.create({
          model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" },
        });

        console.log(`Agent ${this.config.name} received response from OpenAI`);
        return response.choices[0].message.content;
      } else {
        console.log(`Agent ${this.config.name} using mock response`);
        return this.generateMockResponse(messages);
      }
    } catch (error) {
      console.error(`Agent ${this.config.name} chat error:`, error);
      // Fallback to mock responses if API call fails
      console.log(`Falling back to mock response due to API error`);
      return this.generateMockResponse(messages);
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
      usingMockResponses: this.useMockResponses,
    };
  }
}
