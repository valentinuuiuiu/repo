import { SupplierAPI } from '../../integrations/suppliers/types';
import { Marketplace } from '../../integrations/marketplaces/types';

interface ProductCriteria {
  minProfitMargin: number;
  maxPrice: number;
  keywords: string[];
}

export class SourcingAgent {
  private supplier: SupplierAPI;
  private marketplace: Marketplace;

  constructor(supplier: SupplierAPI, marketplace: Marketplace) {
    this.supplier = supplier;
    this.marketplace = marketplace;
  }

  async findProducts(criteria: ProductCriteria) {
    const rawProducts = await this.supplier.searchProducts({
      keywords: criteria.keywords,
      maxPrice: criteria.maxPrice
    });

    return rawProducts
      .map(product => this.calculateProfit(product))
      .filter(product => product.profitMargin >= criteria.minProfitMargin);
  }

  private calculateProfit(sourceProduct: any) {
    const marketplaceFee = this.marketplace.getFeeStructure();
    const estimatedPrice = sourceProduct.price * 2.5; // Standard markup
    
    return {
      ...sourceProduct,
      listingPrice: estimatedPrice,
      profitMargin: (estimatedPrice - sourceProduct.price - marketplaceFee) / estimatedPrice
    };
  }
}