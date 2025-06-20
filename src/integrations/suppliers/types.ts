export interface ProductSearchParams {
  keywords: string[];
  maxPrice?: number;
  minRating?: number;
}

export interface SupplierProduct {
  id: string;
  title: string;
  price: number;
  shippingCost: number;
  rating?: number;
  imageUrl?: string;
}

export interface SupplierAPI {
  searchProducts(params: ProductSearchParams): Promise<SupplierProduct[]>;
  getProductDetails(productId: string): Promise<SupplierProduct>;
}