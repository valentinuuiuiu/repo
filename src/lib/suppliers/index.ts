import { AlibabaSupplier } from "./alibaba";
import { AliExpressSupplier } from "./aliexpress";
import { TemuSupplier } from "./temu";

export type SupplierType = "alibaba" | "aliexpress" | "temu";

export type SupplierConfig = {
  type: SupplierType;
  credentials: Record<string, string>;
  settings?: Record<string, any>;
};

export class SupplierManager {
  private suppliers: Map<SupplierType, any> = new Map();

  async initializeSupplier(config: SupplierConfig) {
    switch (config.type) {
      case "alibaba":
        this.suppliers.set("alibaba", new AlibabaSupplier(config.credentials));
        break;
      case "aliexpress":
        this.suppliers.set(
          "aliexpress",
          new AliExpressSupplier(config.credentials),
        );
        break;
      case "temu":
        this.suppliers.set("temu", new TemuSupplier(config.credentials));
        break;
    }
  }

  getSupplier(type: SupplierType) {
    return this.suppliers.get(type);
  }

  async searchProducts(query: string, options: any = {}) {
    const results = await Promise.all(
      Array.from(this.suppliers.values()).map((supplier) =>
        supplier
          .searchProducts(query, options)
          .then((result) => ({
            supplier: supplier.constructor.name,
            products: result.products,
          }))
          .catch((error) => ({
            supplier: supplier.constructor.name,
            error: error.message,
          })),
      ),
    );

    return results.filter((result) => !result.error);
  }

  async getProductDetails(supplierId: string, productId: string) {
    const supplier = this.suppliers.get(supplierId as SupplierType);
    if (!supplier) {

    return supplier.getProductDetails(productId);
  }

  async placeOrder(supplierId: string, orderData: any) {
    const supplier = this.suppliers.get(supplierId as SupplierType);
    if (!supplier) {

    return supplier.placeOrder(orderData);
  }
}
