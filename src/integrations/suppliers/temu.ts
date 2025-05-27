import { SupplierAPI, ProductSearchParams, SupplierProduct } from './types';

export class TemuAdapter implements SupplierAPI {
  private readonly baseUrl = 'https://api.temu.com/v1';

  async searchProducts(params: ProductSearchParams): Promise<SupplierProduct[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: params.keywords.join(' '),
        max_price: params.maxPrice,
        min_rating: params.minRating || 4.0
      })
    });

    const data = await response.json();
    return data.products.map((item: any) => ({
      id: item.product_id,
      title: item.product_name,
      price: item.price,
      shippingCost: item.shipping_cost || 0,
      rating: item.rating,
      imageUrl: item.main_image
    }));
  }

  async getProductDetails(productId: string): Promise<SupplierProduct> {
    const response = await fetch(`${this.baseUrl}/products/${productId}`);
    return await response.json();
  }
}