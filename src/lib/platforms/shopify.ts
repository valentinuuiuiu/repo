import axios from "axios";
import { Product, ProductVariant } from "@prisma/client";

export class ShopifyIntegration {
  private accessToken: string;
  private shop: string;

  constructor(accessToken: string, shop: string) {
    this.accessToken = accessToken;
    this.shop = shop;
  }

  private get baseUrl() {
    return `https://${this.shop}.myshopify.com/admin/api/2024-01`;
  }

  private get headers() {
    return {
      "X-Shopify-Access-Token": this.accessToken,
      "Content-Type": "application/json",
    };
  }

  async createProduct(product: Product, variants: ProductVariant[]) {
    const shopifyProduct = {
      product: {
        title: product.title,
        body_html: product.description,
        vendor: product.supplier.name,
        product_type: product.category,
        status: product.status === "active" ? "active" : "draft",
        variants: variants.map((variant) => ({
          title: variant.title,
          sku: variant.sku,
          price: variant.price.toString(),
          compare_at_price: variant.compareAtPrice?.toString(),
          inventory_quantity: variant.inventory,
          option1: variant.options.option1,
          option2: variant.options.option2,
          option3: variant.options.option3,
        })),
        images: product.images.map((image) => ({
          src: image,
        })),
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/products.json`,
      shopifyProduct,
      { headers: this.headers },
    );

    return response.data.product;
  }

  async updateProduct(
    shopifyId: string,
    product: Partial<Product>,
    variants?: ProductVariant[],
  ) {
    const shopifyProduct: any = {
      product: {
        id: shopifyId,
      },
    };

    if (product.title) shopifyProduct.product.title = product.title;
    if (product.description)
      shopifyProduct.product.body_html = product.description;
    if (product.status)
      shopifyProduct.product.status =
        product.status === "active" ? "active" : "draft";

    if (variants) {
      shopifyProduct.product.variants = variants.map((variant) => ({
        title: variant.title,
        sku: variant.sku,
        price: variant.price.toString(),
        compare_at_price: variant.compareAtPrice?.toString(),
        inventory_quantity: variant.inventory,
        option1: variant.options.option1,
        option2: variant.options.option2,
        option3: variant.options.option3,
      }));
    }

    const response = await axios.put(
      `${this.baseUrl}/products/${shopifyId}.json`,
      shopifyProduct,
      { headers: this.headers },
    );

    return response.data.product;
  }

  async deleteProduct(shopifyId: string) {
    await axios.delete(`${this.baseUrl}/products/${shopifyId}.json`, {
      headers: this.headers,
    });
  }

  async syncOrders() {
    const response = await axios.get(`${this.baseUrl}/orders.json?status=any`, {
      headers: this.headers,
    });

    return response.data.orders;
  }
}
