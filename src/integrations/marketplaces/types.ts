export interface MarketplaceFee {
  listingFee: number;
  commissionRate: number;
  paymentProcessingFee: number;
}

export interface MarketplaceListing {
  title: string;
  description: string;
  price: number;
  images: string[];
}

export interface Marketplace {
  getFeeStructure(): MarketplaceFee;
  prepareListing(product: any): MarketplaceListing;
  publishListing(listing: MarketplaceListing): Promise<string>;
}