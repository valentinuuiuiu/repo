// Supplier type definitions
export interface Supplier {
  id: number;
  name: string;
  country: string;
  categories: string[];
  rating: number;
  productsCount: number;
  verified: boolean;
  logo: string;
  description: string;
  specialties: string[];
}