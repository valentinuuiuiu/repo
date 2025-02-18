import { ShopifyIntegration } from "./shopify";
import { WooCommerceIntegration } from "./woocommerce";
import { EbayIntegration } from "./ebay";
import { EtsyIntegration } from "./etsy";
import { AmazonIntegration } from "./amazon";

export type PlatformType =
  | "shopify"
  | "woocommerce"
  | "ebay"
  | "etsy"
  | "amazon";

export type PlatformConfig = {
  type: PlatformType;
  credentials: Record<string, string>;
  settings?: Record<string, any>;
};

export class PlatformManager {
  private platforms: Map<PlatformType, any> = new Map();

  async initializePlatform(config: PlatformConfig) {
    switch (config.type) {
      case "shopify":
        this.platforms.set(
          "shopify",
          new ShopifyIntegration(config.credentials),
        );
        break;
      case "woocommerce":
        this.platforms.set(
          "woocommerce",
          new WooCommerceIntegration(config.credentials),
        );
        break;
      case "ebay":
        this.platforms.set("ebay", new EbayIntegration(config.credentials));
        break;
      case "etsy":
        this.platforms.set("etsy", new EtsyIntegration(config.credentials));
        break;
      case "amazon":
        this.platforms.set("amazon", new AmazonIntegration(config.credentials));
        break;
    }
  }

  getPlatform(type: PlatformType) {
    return this.platforms.get(type);
  }
}
