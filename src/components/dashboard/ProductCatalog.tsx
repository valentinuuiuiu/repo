import React from "react";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";

interface ProductCatalogProps {
  onSearch?: (value: string) => void;
  onCategoryChange?: (category: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSupplierRatingChange?: (rating: string) => void;
  products?: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
    supplierRating: number;
    inStock: boolean;
    category: string;
  }>;
  isLoading?: boolean;
}

const ProductCatalog = ({
  onSearch = () => {},
  onCategoryChange = () => {},
  onPriceRangeChange = () => {},
  onSupplierRatingChange = () => {},
  products = [
    {
      id: "1",
      title: "Wireless Headphones",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      supplierRating: 4.5,
      inStock: true,
      category: "Electronics",
    },
    {
      id: "2",
      title: "Smart Watch",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      supplierRating: 4.8,
      inStock: true,
      category: "Electronics",
    },
    {
      id: "3",
      title: "Laptop Backpack",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
      supplierRating: 4.2,
      inStock: false,
      category: "Accessories",
    },
  ],
  isLoading = false,
}: ProductCatalogProps) => {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <ProductFilters
        onSearch={onSearch}
        onCategoryChange={onCategoryChange}
        onPriceRangeChange={onPriceRangeChange}
        onSupplierRatingChange={onSupplierRatingChange}
      />
      <div className="flex-1 overflow-auto">
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ProductCatalog;
