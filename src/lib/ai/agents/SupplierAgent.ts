import { BaseAgent } from "../core/BaseAgent";
import type { Supplier, Order, Product } from "@/types/schema";
import type { AgentResponse } from "../types";

export class SupplierAgent extends BaseAgent {
  constructor() {
    super({
      name: "supplier-agent",
      description: "AI agent for supplier analysis, performance monitoring and optimization",
    });
  }

  async analyzePerformance(supplier: Supplier, orders: Order[]): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a supplier performance analyst. Evaluate the supplier's performance metrics and provide insights.
                 Consider: fulfillment speed, quality scores, communication, reliability, and overall value.
                 Calculate trends and identify potential issues before they become problems.`,
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
            items: order.items,
          })),
        }),
      },
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: analysis,
        metadata: {
          confidence: this.calculateConfidence(analysis),
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message,
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  async optimizeInventory(supplier: Supplier, products: Product[]): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are an inventory optimization specialist. Analyze supplier products and suggest optimal inventory levels.
                 Consider: historical sales data, lead times, seasonal patterns, and carrying costs.
                 Provide specific recommendations for each product.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          supplier,
          products: products.map(p => ({
            id: p.id,
            title: p.title,
            inventory: p.inventory,
            price: p.price,
            costPrice: p.costPrice,
            category: p.category,
            tags: p.tags
          }))
        }),
      },
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const analysis = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: analysis,
        metadata: {
          confidence: this.calculateConfidence(analysis),
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message,
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  async predictReliability(supplier: Supplier, orders: Order[]): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a supplier reliability predictor. Analyze historical data and predict future performance.
                 Consider: order history, consistency, seasonal patterns, and risk factors.
                 Provide risk assessment and mitigation strategies.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          supplier: {
            name: supplier.name,
            rating: supplier.rating,
            status: supplier.status,
            fulfillmentSpeed: supplier.fulfillmentSpeed,
            qualityScore: supplier.qualityScore,
          },
          orderHistory: orders.map((order) => ({
            date: order.createdAt,
            status: order.status,
            fulfillmentStatus: order.fulfillmentStatus,
            items: order.items
          })),
        }),
      },
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      const prediction = JSON.parse(response || "{}");
      
      return {
        success: true,
        data: prediction,
        metadata: {
          confidence: this.calculateConfidence(prediction),
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message,
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  private calculateConfidence(analysis: any): number {
    // Calculate confidence based on data completeness and consistency
    let confidence = 0.5; // Base confidence
    
    if (!analysis) return 0;
    
    // Check for required fields
    const hasRequiredFields = ['recommendations', 'analysis', 'risks'].every(
      field => field in analysis
    );
    if (hasRequiredFields) confidence += 0.2;
    
    // Check for data quality
    const hasDetailedAnalysis = analysis.analysis?.length > 100;
    if (hasDetailedAnalysis) confidence += 0.1;
    
    // Check for specific metrics
    const hasMetrics = analysis.metrics && Object.keys(analysis.metrics).length > 0;
    if (hasMetrics) confidence += 0.1;
    
    // Check for actionable recommendations
    const hasActionableRecs = analysis.recommendations?.length > 2;
    if (hasActionableRecs) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}
