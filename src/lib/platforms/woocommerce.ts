import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { Product, ProductVariant } from "@prisma/client";

export class WooCommerceIntegration {
  private api: any;

  constructor(url: string, consumerKey: string, consumerSecret: string) {
    this.api = new WooCommerceRestApi({
      url,
      consumerKey,
      consumerSecret,
      version: "wc/v3",
    });
  }

  async createProduct(product: Product, variants: ProductVariant[]) {
    const wooProduct = {
      name: product.title,
      description: product.description,
      regular_price: product.price.toString(),
      sale_price: product.compareAtPrice?.toString(),
      manage_stock: true,
      stock_quantity: product.inventory,
      status: product.status === "active" ? "publish" : "draft",
      categories: [
        {
          name: product.category,
        },
      ],
      images: product.images.map((image) => ({
        src: image,
      })),
      variations: variants.map((variant) => ({
        regular_price: variant.price.toString(),
        sale_price: variant.compareAtPrice?.toString(),
        manage_stock: true,
        stock_quantity: variant.inventory,
        attributes: Object.entries(variant.options).map(([name, value]) => ({
          name,
          option: value,
        })),
      })),
    };

    const response = await this.api.post("products", wooProduct);
    return response.data;
  }

  async updateProduct(
    wooId: string,
    product: Partial<Product>,
    variants?: ProductVariant[],
  ) {
    const wooProduct: any = {};

    if (product.title) wooProduct.name = product.title;
    if (product.description) wooProduct.description = product.description;
    if (product.price) wooProduct.regular_price = product.price.toString();
    if (product.compareAtPrice)
      wooProduct.sale_price = product.compareAtPrice.toString();
    if (product.inventory !== undefined) {
      wooProduct.manage_stock = true;
      wooProduct.stock_quantity = product.inventory;
    }
    if (product.status) {
      wooProduct.status = product.status === "active" ? "publish" : "draft";
    }

    if (variants) {
      wooProduct.variations = variants.map((variant) => ({
        regular_price: variant.price.toString(),
        sale_price: variant.compareAtPrice?.toString(),
        manage_stock: true,
        stock_quantity: variant.inventory,
        attributes: Object.entries(variant.options).map(([name, value]) => ({
          name,
          option: value,
        })),
      }));
    }

    const response = await this.api.put(`products/${wooId}`, wooProduct);
    return response.data;
  }

  async deleteProduct(wooId: string) {
    await this.api.delete(`products/${wooId}`);
  }

  async syncOrders() {
    const response = await this.api.get("orders");
    return response.data;
  }
}
