export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number;
  sku: string | null;
  barcode: string | null;
  image: string | null; // Ensure image property is included
  supplierRating: number | null; // Ensure supplierRating property is included
  inStock: boolean | null; // Ensure inStock property is included
  status: string;
  updatedAt: Date;
}