import { BaseAgent } from "../core/BaseAgent";
import type { Product } from "@/types/schema";

export class ProductAgent extends BaseAgent {
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
