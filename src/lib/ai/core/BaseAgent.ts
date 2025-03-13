export interface AgentConfig {
  name: string;
  description: string;
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  protected async chat(messages: Array<ChatMessage>) {
    try {
      console.log(`Agent ${this.config.name} processing request...`);
      console.log(`Using mock response for ${this.config.name}`);
      return this.generateMockResponse(messages);
    } catch (error) {
      console.error(`Agent ${this.config.name} chat error:`, error);
      return this.generateMockResponse(messages);
    }
  }

  private generateMockResponse(messages: Array<ChatMessage>): string {
    try {
      const lastMessage = messages[messages.length - 1].content as string;
      const agentType = this.config.name;
      let lastMessageData = {};

      try {
        lastMessageData = JSON.parse(lastMessage);
      } catch (e) {
        console.log(
          "Could not parse last message as JSON, using default mock response",
        );
      }

      // Create different mock responses based on agent type for dropshipping context
      if (agentType.includes("product")) {
        return JSON.stringify({
          recommendedPrice: 79.99,
          pricingStrategy: "Premium pricing with 40% markup from supplier cost",
          competitiveAnalysis:
            "Product is positioned well against competitors in the dropshipping market",
          optimizedTitle:
            "Premium Wireless Earbuds with Active Noise Cancellation - Fast Shipping",
          optimizedDescription:
            "Experience crystal-clear sound with our advanced noise cancellation technology. Ships directly from verified suppliers within 3-5 business days.",
          supplierRecommendations: [
            "TechSupplies Inc (4.8★)",
            "ElectroWholesale (4.7★)",
          ],
          shippingTimeEstimate: "3-5 business days",
          profitMargin: "42% at recommended price",
        });
      } else if (agentType.includes("supplier")) {
        return JSON.stringify({
          supplierRating: 4.7,
          reliabilityScore: 0.92,
          fulfillmentSpeed: "2.3 days average",
          recommendedActions: [
            "Negotiate better shipping rates for bulk orders",
            "Increase order volume for better pricing",
            "Set up automated reordering at 25% inventory level",
          ],
          alternativeSuppliers: [
            "QuickShip Electronics (4.5★)",
            "GlobalTech Wholesale (4.3★)",
          ],
          riskAssessment:
            "Low risk supplier with consistent delivery times and quality products",
          inventoryAvailability:
            "Currently stocking 15,000+ units across 120 product categories",
        });
      } else if (agentType.includes("marketing")) {
        return JSON.stringify({
          targetAudience:
            "Tech-savvy professionals, 25-45 years old, with disposable income",
          marketingChannels: ["Instagram", "Facebook", "Google Ads", "TikTok"],
          campaignIdeas: [
            "30-day satisfaction guarantee",
            "Influencer partnerships with tech reviewers",
            "Free shipping on orders over $50",
          ],
          conversionOptimization:
            "Add social proof, limited-time offers, and shipping time guarantees",
          adPerformanceMetrics: {
            averageCPC: "$0.87",
            conversionRate: "3.2%",
            ROAS: "4.5x",
          },
        });
      } else if (agentType.includes("inventory")) {
        return JSON.stringify({
          forecastDemand: 250,
          reorderPoint: 50,
          optimalStockLevel: 150,
          seasonalityFactor: 1.3,
          daysUntilReorder: 14,
          stockoutRisk: "Low",
          supplierLeadTime: "7-10 days",
          recommendedBuffer: "30% above forecast for high-demand items",
          automatedAlerts: [
            "Set low stock alerts at 25% of optimal level",
            "Configure supplier notifications for bulk restocking",
          ],
          inventorySyncStatus: "Connected to Shopify and WooCommerce stores",
        });
      } else if (agentType.includes("customer")) {
        return JSON.stringify({
          responseTemplate:
            "Thank you for your inquiry. Your order #{{order_id}} from our dropshipping store is currently {{status}} and expected to arrive by {{delivery_date}}. Your package is being shipped directly from our verified supplier.",
          sentimentAnalysis: "Positive",
          recommendedActions: [
            "Send tracking information immediately upon supplier shipment",
            "Offer 10% discount on next purchase for customer retention",
            "Set up automated delivery updates every 48 hours",
          ],
          customerLifetimeValue: "High",
          commonIssues: [
            "Shipping delays",
            "Product quality concerns",
            "Order tracking questions",
          ],
          automatedResponses: {
            shippingDelay:
              "We apologize for the delay in your order. We're working with our supplier to expedite your shipment and will provide an updated delivery estimate within 24 hours.",
            trackingRequest:
              "Your tracking information will be sent automatically once your order ships from our supplier, typically within 1-2 business days of order placement.",
          },
        });
      } else {
        // Default response for manager or unknown agent types
        return JSON.stringify({
          recommendation:
            "Based on department insights, optimize your dropshipping operation with the following strategy",
          confidenceScore: 0.85,
          nextSteps: [
            "Implement dynamic pricing with 35-45% markup from supplier costs",
            "Prioritize suppliers with 2-day or faster shipping times",
            "Set up automated inventory sync between suppliers and your store",
            "Configure email notifications for order status updates",
          ],
          expectedOutcome:
            "15% increase in sales with 5% higher margins and improved customer satisfaction",
          platformIntegrations: ["Shopify", "WooCommerce", "Stripe"],
          supplierNetwork: "12 verified suppliers across 8 product categories",
        });
      }
    } catch (error) {
      console.error("Error generating mock response:", error);
      return JSON.stringify({
        error: "Failed to generate response",
        recommendation: "Please try again with different parameters",
        status: "error",
      });
    }
  }

  getStatus() {
    return {
      name: this.config.name,
      description: this.config.description,
      status: "active",
      usingMockResponses: true,
    };
  }
}
