import { ProductAgent } from "./agents/ProductAgent";
import { SupplierAgent } from "./agents/SupplierAgent";
import { SupplierManager } from "../suppliers";
import { PlatformManager } from "../platforms";

export class AIService {
  private productAgent: ProductAgent;
  private supplierAgent: SupplierAgent;

  constructor(
    supplierManager: SupplierManager,
    platformManager: PlatformManager,
  ) {
    this.productAgent = new ProductAgent(supplierManager, platformManager);
    this.supplierAgent = new SupplierAgent(supplierManager);
  }

  async optimizeProduct(productId: string, sourceSupplier: string) {
    return this.productAgent.optimizeProduct(productId, sourceSupplier);
  }

  async analyzeSupplier(supplierId: string) {
    return this.supplierAgent.analyzeSupplier(supplierId);
  }

  async findBestSupplier(productQuery: string) {
    return this.supplierAgent.suggestBestSupplier(productQuery);
  }

  async generateProductDescription(product: any) {
    return this.productAgent.generateDescription(product);
  }

  async optimizePricing(product: any, marketData: any) {
    return this.productAgent.optimizePricing(product, marketData);
  }

  async handleCustomerQuery(query: string, context: any) {
    return this.handleCustomerSupport(query, context);
  }
}
