import { prisma } from "../prisma";
import { supabase } from "../supabase";
import { ShopifyIntegration } from "../platforms/shopify";
import { WooCommerceIntegration } from "../platforms/woocommerce";

export class InventorySyncService {
  private shopifyIntegration?: ShopifyIntegration;
  private wooCommerceIntegration?: WooCommerceIntegration;

  constructor(store: any) {
    if (store.platform === "shopify") {
      this.shopifyIntegration = new ShopifyIntegration(
        store.accessToken,
        store.domain,
      );
    } else if (store.platform === "woocommerce") {
      this.wooCommerceIntegration = new WooCommerceIntegration(
        store.url,
        store.consumerKey,
        store.consumerSecret,
      );
    }
  }

  async syncInventory(productId: string, newQuantity: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) throw new Error("Product not found");

    // Update local inventory
    await prisma.product.update({
      where: { id: productId },
      data: { inventory: newQuantity },
    });

    // Log inventory change
    await prisma.inventoryLog.create({
      data: {
        productId,
        oldQuantity: product.inventory,
        newQuantity,
        timestamp: new Date(),
        type: "manual",
      },
    });

    // Sync with e-commerce platforms
    if (this.shopifyIntegration) {
      await this.shopifyIntegration.updateProduct(
        product.platformId,
        { inventory: newQuantity },
        product.variants,
      );
    }

    if (this.wooCommerceIntegration) {
      await this.wooCommerceIntegration.updateProduct(
        product.platformId,
        { inventory: newQuantity },
        product.variants,
      );
    }

    // Notify subscribers through Supabase realtime
    await supabase.from("inventory_updates").insert({
      product_id: productId,
      quantity: newQuantity,
      timestamp: new Date(),
    });
  }

  async setupWebhooks(store: any) {
    if (this.shopifyIntegration) {
      // Set up Shopify webhooks
      const webhooks = [
        {
          topic: "products/update",
          address: `${process.env.API_URL}/webhooks/shopify/products`,
        },
        {
          topic: "orders/create",
          address: `${process.env.API_URL}/webhooks/shopify/orders`,
        },
      ];

      for (const webhook of webhooks) {
        await this.shopifyIntegration.createWebhook(webhook);
      }
    }

    if (this.wooCommerceIntegration) {
      // Set up WooCommerce webhooks
      const webhooks = [
        {
          name: "Product updated",
          topic: "product.updated",
          delivery_url: `${process.env.API_URL}/webhooks/woocommerce/products`,
        },
        {
          name: "Order created",
          topic: "order.created",
          delivery_url: `${process.env.API_URL}/webhooks/woocommerce/orders`,
        },
      ];

      for (const webhook of webhooks) {
        await this.wooCommerceIntegration.createWebhook(webhook);
      }
    }
  }
}
