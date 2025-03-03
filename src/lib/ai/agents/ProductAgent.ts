import { BaseAgent, AgentConfig } from "../core/BaseAgent";
import type { Product } from "@/types/schema";
import type { AgentResponse, Task } from "../types";

export class ProductAgent extends BaseAgent {
  constructor(config?: Partial<AgentConfig>) {
    super({
      name: "product-agent",
      type: "PRODUCT" as any, // Using any as a temporary fix until we align AgentType with @prisma/client
      description: "AI agent for product analysis, optimization and pricing strategies",
      capabilities: [
        "product-pricing",
        "description-optimization",
        "trend-analysis",
        "marketplace-optimization",
        "competition-analysis",
        "tag-suggestion"
      ],
      ...config
    });
  }

  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Determine which function to call based on task type
      switch (task.type) {
        case 'analyze-pricing':
          return await this.analyzePricing(task.data as Product);
        case 'optimize-description':
          return await this.optimizeDescription(task.data as Product);
        case 'find-trending-products':
          return await this.findTrendingProducts(
            (task.data as any).category, 
            (task.data as any).marketData
          );
        case 'optimize-listings':
          return await this.optimizeListings(
            (task.data as any).product, 
            (task.data as any).platform
          );
        case 'analyze-competition':
          return await this.analyzeCompetition(
            (task.data as any).product, 
            (task.data as any).marketplaceData
          );
        case 'suggest-tags':
          return await this.suggestTags(task.data as Product);
        default:
          throw new Error(`Task type ${task.type} not supported by ProductAgent`);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async analyzePricing(product: Product): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a product pricing specialist. Analyze the product data and provide pricing recommendations. 
                 Consider: market position, competitor prices, profit margins, and market trends.
                 Respond with a JSON object containing: { "recommendedPrice": number, "reasoning": string, "marketPosition": string, "profitMargin": number }`
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          title: product.title,
          currentPrice: product.price,
          costPrice: product.costPrice,
          category: product.category
        })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let analysis;
      
      try {
        analysis = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        analysis = {
          recommendedPrice: product.price, // Default to current price
          reasoning: response || "No analysis provided",
          marketPosition: "unknown",
          profitMargin: product.price && product.costPrice 
            ? ((product.price - product.costPrice) / product.price) * 100 
            : 0
        };
      }
      
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
      return this.handleError(error);
    }
  }

  private calculateConfidence(analysis: any): number {
    // Calculate confidence based on completeness of analysis
    const requiredFields = ['recommendedPrice', 'reasoning', 'marketPosition'];
    const presentFields = requiredFields.filter(field => analysis[field] !== undefined);
    return presentFields.length / requiredFields.length;
  }

  async optimizeDescription(product: Product): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a product content specialist. Optimize the product description for better conversion rates.
                 Focus on: key features, benefits, SEO optimization, and compelling selling points.
                 Respond with a JSON object containing: { "optimizedTitle": string, "optimizedDescription": string, "keyFeatures": string[], "seoKeywords": string[] }`
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          title: product.title,
          description: product.description,
          category: product.category,
          tags: product.tags
        })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let optimized;
      
      try {
        optimized = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        optimized = {
          optimizedTitle: product.title,
          optimizedDescription: response || product.description,
          keyFeatures: [],
          seoKeywords: product.tags || []
        };
      }
      
      return {
        success: true,
        data: optimized,
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

  async findTrendingProducts(category: string, marketData: any): Promise<AgentResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a product trend analyst for dropshipping. Identify trending products with high potential.
                 Consider: search trends, social media mentions, seasonal patterns, and competition levels.
                 Suggest specific products with supplier options and potential profit margins.
                 Respond with a JSON array of trending products, each containing: { "name": string, "category": string, "estimatedDemand": string, "potentialProfitMargin": string, "supplierOptions": string[], "competitionLevel": string }`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ category, marketData })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let trendingProducts;
      
      try {
        trendingProducts = response ? JSON.parse(response) : [];
      } catch (e) {
        // If parsing fails, create a structured response
        trendingProducts = response 
          ? { products: [{ name: "Unknown product", reason: response }] }
          : { products: [] };
      }
      
      return {
        success: true,
        data: trendingProducts,
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

  async optimizeListings(product: Product, platform: string): Promise<AgentResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a marketplace listing optimizer for ${platform}. Create optimized product listings.
                 Consider: platform-specific requirements, SEO keywords, high-converting descriptions, and competitive analysis.
                 Provide complete listing details including title, description, bullets, and backend keywords.
                 Respond with a JSON object containing: { "title": string, "description": string, "bulletPoints": string[], "keywords": string[], "categoryRecommendation": string }`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ product, platform })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let optimizedListing;
      
      try {
        optimizedListing = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        optimizedListing = {
          title: product.title,
          description: response || product.description,
          bulletPoints: [],
          keywords: product.tags || [],
          categoryRecommendation: product.category
        };
      }
      
      return {
        success: true,
        data: optimizedListing,
        metadata: {
          confidence: 0.88,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async analyzeCompetition(product: Product, marketplaceData: any): Promise<AgentResponse> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a dropshipping competition analyst. Analyze competitor offerings and suggest differentiation strategies.
                 Consider: pricing strategies, shipping options, listing quality, reviews, and unique selling propositions.
                 Respond with a JSON object containing: { "competitorAnalysis": object, "differentiationStrategies": string[], "pricingRecommendation": object, "marketGaps": string[] }`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ product, marketplaceData })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let competitionAnalysis;
      
      try {
        competitionAnalysis = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        competitionAnalysis = {
          competitorAnalysis: {},
          differentiationStrategies: [response || "No strategies provided"],
          pricingRecommendation: {},
          marketGaps: []
        };
      }
      
      return {
        success: true,
        data: competitionAnalysis,
        metadata: {
          confidence: 0.87,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async suggestTags(product: Product): Promise<AgentResponse> {
    const messages = [
      {
        role: "system" as const,
        content: `You are a product categorization specialist. Suggest relevant tags and categories for the product.
                 Consider: product type, features, target audience, and search trends.
                 Respond with a JSON object containing: { "suggestedTags": string[], "suggestedCategory": string, "searchTerms": string[], "targetAudience": string[] }`
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          title: product.title,
          description: product.description,
          currentTags: product.tags,
          category: product.category
        })
      }
    ];

    try {
      const startTime = Date.now();
      const response = await this.chat(messages);
      let suggestedTags;
      
      try {
        suggestedTags = response ? JSON.parse(response) : {};
      } catch (e) {
        // If parsing fails, create a structured response
        suggestedTags = {
          suggestedTags: product.tags || [],
          suggestedCategory: product.category,
          searchTerms: [],
          targetAudience: []
        };
      }
      
      return {
        success: true,
        data: suggestedTags,
        metadata: {
          confidence: 0.83,
          processingTime: Date.now() - startTime,
          modelUsed: "gpt-4"
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
