import { BaseAgent } from "../core/BaseAgent";
import type { Product, Order } from "@/types/schema";
import type { AgentResponse } from "../types";

export class MarketResearchAgent extends BaseAgent {
  constructor() {
    super({
      name: "market-research-agent",
      description: "AI agent for market research, trend analysis, and competitive intelligence",
    });
  }

  async analyzeTrends(products: Product[], timeframe: string): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a market research analyst specializing in trend analysis.
                 Analyze product performance patterns and market trends.
                 Consider: sales velocity, price sensitivity, seasonal patterns, and market demand.
                 Provide actionable insights and future predictions.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          products: products.map(p => ({
            title: p.title,
            category: p.category,
            price: p.price,
            inventory: p.inventory,
            tags: p.tags
          })),
          timeframe
        }),
      },
    ];

    try {
      const startTime = Date.now();
      const analysis = await this.processAnalysis(messages);
      
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
      return this.handleError(this.wrapError(error));
    }
  }

  async predictMarketDemand(category: string, historicalData: any): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a market demand forecasting specialist.
                 Analyze historical data and predict future market demand.
                 Consider: market trends, competitive landscape, and economic indicators.
                 Provide demand forecasts and confidence intervals.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          category,
          historicalData,
          currentDate: new Date()
        }),
      },
    ];

    try {
      const startTime = Date.now();
      const forecast = await this.processAnalysis(messages);
      
      return {
        success: true,
        data: forecast,
        metadata: {
          confidence: this.calculateConfidence(forecast),
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(this.wrapError(error));
    }
  }

  async competitorAnalysis(productCategory: string): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a competitive intelligence analyst.
                 Analyze market competition and positioning strategies.
                 Consider: pricing strategies, product features, market share, and competitive advantages.
                 Provide strategic recommendations for market positioning.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          category: productCategory,
          analysisDate: new Date()
        }),
      },
    ];

    try {
      const startTime = Date.now();
      const analysis = await this.processAnalysis(messages);
      
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
      return this.handleError(this.wrapError(error));
    }
  }

  async conductResearch(data: { products?: Product[]; category?: string; timeframe?: string }): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a market research specialist.
                 Analyze market data and provide comprehensive insights.
                 Consider: product performance, market trends, competition, and opportunities.
                 Provide actionable recommendations based on data analysis.`
      },
      {
        role: "user" as const,
        content: JSON.stringify(data)
      }
    ];

    try {
      const startTime = Date.now();
      const analysis = await this.processAnalysis(messages);
      
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
      return this.handleError(this.wrapError(error));
    }
  }

  private async processAnalysis(messages: any[]): Promise<any> {
    try {
      const response = await this.chat(messages);
      return JSON.parse(response || "{}");
    } catch (error) {
      throw this.wrapError(error);
    }
  }

  protected handleError(error: Error): AgentResponse {
    return {
      success: false,
      data: null,
      error: error.message,
      metadata: {
        confidence: 0,
        processingTime: 0,
        modelUsed: this.config.name
      }
    };
  }

  private calculateConfidence(analysis: any): number {
    if (!analysis) return 0;
    
    let confidence = 0.5;
    
    // Check data completeness
    const requiredSections = ['analysis', 'predictions', 'recommendations'];
    const completeness = requiredSections.filter(section => section in analysis).length / requiredSections.length;
    confidence += completeness * 0.2;
    
    // Check prediction confidence intervals
    if (analysis.predictions?.confidenceIntervals) {
      confidence += 0.1;
    }
    
    // Check data sources
    if (analysis.dataSources?.length > 0) {
      confidence += 0.1;
    }
    
    // Check recommendation specificity
    if (analysis.recommendations?.some((rec: any) => rec.impact && rec.timeline)) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Method to handle unknown errors
  private wrapError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error(String(error));
  }
}