import { AIAgent } from "..";
import { SupplierManager } from "../../suppliers";
import { PlatformManager } from "../../platforms";

export class ProductAgent {
  private supplierManager: SupplierManager;
  private platformManager: PlatformManager;

  constructor(
    supplierManager: SupplierManager,
    platformManager: PlatformManager,
  ) {
    this.supplierManager = supplierManager;
    this.platformManager = platformManager;
  }

  async optimizeProduct(productId: string, sourceSupplier: string) {
    // Get product details from supplier
    const product = await this.supplierManager.getProductDetails(
      sourceSupplier,
      productId,
    );

    // Generate optimized description
    const description = await AIAgent.generateProductDescription(product);

    // Get market data from connected platforms
    const marketData = await this.getMarketData(product.category);

    // Optimize pricing
    const pricingData = await AIAgent.optimizePricing(product, marketData);

    // Generate SEO tags
    const tags = await AIAgent.suggestTags(product);

    return {
      ...product,
      description,
      suggestedPrice: pricingData.price,
      pricingStrategy: pricingData.strategy,
      tags,
      marketAnalysis: pricingData.analysis,
    };
  }

  private async getMarketData(category: string) {
    // Collect pricing and demand data from all connected platforms
    const platformData = await Promise.all(
      Array.from(this.platformManager.platforms.values()).map(
        async (platform) => {
          try {
            const response = await platform.searchProducts({ category });
            return {
              platform: platform.constructor.name,
              products: response.products,
              stats: this.calculateStats(response.products),
            };
          } catch (error) {
            console.error(
              `Failed to get market data from ${platform.constructor.name}:`,
              error,
            );
            return null;
          }
        },
      ),
    );

    return platformData.filter(Boolean);
  }

  private calculateStats(products: any[]) {
    const prices = products.map((p) => p.price);
    return {
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      totalProducts: products.length,
    };
  }
}
