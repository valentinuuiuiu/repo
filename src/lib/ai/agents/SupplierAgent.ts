import { AIAgent } from "..";
import { SupplierManager } from "../../suppliers";

export class SupplierAgent {
  private supplierManager: SupplierManager;

  constructor(supplierManager: SupplierManager) {
    this.supplierManager = supplierManager;
  }

  async analyzeSupplier(supplierId: string) {
    const supplier = this.supplierManager.getSupplier(supplierId);
    if (!supplier) throw new Error(`Supplier ${supplierId} not found`);

    // Collect supplier performance data
    const performanceData = await this.collectPerformanceData(supplier);

    // Analyze supplier using AI
    const analysis = await AIAgent.analyzeSupplier(performanceData);

    return {
      supplierId,
      analysis,
      performanceData,
      recommendations: analysis.recommendations,
    };
  }

  async suggestBestSupplier(productQuery: string) {
    // Search products across all suppliers
    const results = await this.supplierManager.searchProducts(productQuery);

    // Collect performance data for each supplier
    const supplierData = await Promise.all(
      results.map(async (result) => {
        const performanceData = await this.collectPerformanceData(
          this.supplierManager.getSupplier(result.supplier),
        );
        return {
          supplier: result.supplier,
          products: result.products,
          performance: performanceData,
        };
      }),
    );

    // Analyze each supplier
    const analyses = await Promise.all(
      supplierData.map((data) => AIAgent.analyzeSupplier(data)),
    );

    // Combine analyses with supplier data
    return supplierData.map((data, i) => ({
      ...data,
      analysis: analyses[i],
    }));
  }

  private async collectPerformanceData(supplier: any) {
    return {
      orderFulfillmentRate: await supplier.getOrderFulfillmentRate(),
      shippingTimes: await supplier.getAverageShippingTimes(),
      productQuality: await supplier.getProductQualityMetrics(),
      communication: await supplier.getCommunicationMetrics(),
      pricing: await supplier.getPricingAnalysis(),
      returns: await supplier.getReturnsData(),
    };
  }
}
