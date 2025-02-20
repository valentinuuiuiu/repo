import { BaseAgent } from "../core/BaseAgent";
import type { Product } from "@/types/schema";

export class ProductAgent extends BaseAgent {
  constructor() {
    super({
      name: 'product-agent',
      description: 'AI agent for dropshipping product analysis and optimization'
    });
  }

  async analyzePricing(product: Product) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a dropshipping pricing specialist. Analyze the product and suggest optimal pricing strategies.
                 Consider: supplier cost, shipping costs, competitor prices, market demand, and target profit margins.
                 Provide specific price points for different marketplaces (Amazon, eBay, Shopify store).`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({
          product,
          request: 'Analyze pricing strategy for this product'
        })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async findTrendingProducts(category: string, marketData: any) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a product trend analyst for dropshipping. Identify trending products with high potential.
                 Consider: search trends, social media mentions, seasonal patterns, and competition levels.
                 Suggest specific products with supplier options and potential profit margins.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ category, marketData })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async optimizeListings(product: Product, platform: string) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a marketplace listing optimizer for ${platform}. Create optimized product listings.
                 Consider: platform-specific requirements, SEO keywords, high-converting descriptions, and competitive analysis.
                 Provide complete listing details including title, description, bullets, and backend keywords.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ product, platform })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }

  async analyzeCompetition(product: Product, marketplaceData: any) {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a dropshipping competition analyst. Analyze competitor offerings and suggest differentiation strategies.
                 Consider: pricing strategies, shipping options, listing quality, reviews, and unique selling propositions.`
      },
      {
        role: 'user' as const,
        content: JSON.stringify({ product, marketplaceData })
      }
    ];
    return JSON.parse(await this.chat(messages) || '{}');
  }
} {
  constructor() {
    super({
      name: "product-agent",
      description:
        "AI agent for product analysis, optimization and pricing strategies",
    });
  }

  async analyzePricing(product: Product) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a product pricing specialist. Analyze the product data and provide pricing recommendations. 
                 Consider: market position, competitor prices, profit margins, and market trends.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          title: product.title,
          currentPrice: product.price,
          costPrice: product.costPrice,
          category: product.category,
          competitorPrices: product.competitorPrices || [],
        }),
      },
    ];

    const response = await this.chat(messages);
    return JSON.parse(response || "{}");
  }

  async optimizeDescription(product: Product) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a product content specialist. Optimize the product description for better conversion rates.
                 Focus on: key features, benefits, SEO optimization, and compelling selling points.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          title: product.title,
          description: product.description,
          category: product.category,
          tags: product.tags,
        }),
      },
    ];

    const response = await this.chat(messages);
    return JSON.parse(response || "{}");
  }

  async suggestTags(product: Product) {
    const messages = [
      {
        role: "system" as const,
        content: `You are a product categorization specialist. Suggest relevant tags and categories for the product.
                 Consider: product type, features, target audience, and search trends.`,
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          title: product.title,
          description: product.description,
          currentTags: product.tags,
          category: product.category,
        }),
      },
    ];

    const response = await this.chat(messages);
    return JSON.parse(response || "{}");
  }
}
