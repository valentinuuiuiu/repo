import React, { useState, useEffect } from "react";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  supplierRating: number;
  inStock: boolean;
  category: string;
}

interface ProductCatalogProps {
  onSearch?: (value: string) => void;
  onCategoryChange?: (category: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSupplierRatingChange?: (rating: string) => void;
  products?: Product[];
  isLoading?: boolean;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSearch = () => {},
  onCategoryChange = () => {},
  onPriceRangeChange = () => {},
  onSupplierRatingChange = () => {},
  products = [
    {
      id: "1",
      title: "Wireless Headphones",
      price: 99.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      supplierRating: 4.5,
      inStock: true,
      category: "Electronics",
    },
    {
      id: "2",
      title: "Smart Watch",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      supplierRating: 4.8,
      inStock: true,
      category: "Electronics",
    },
    {
      id: "3",
      title: "Laptop Backpack",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      supplierRating: 4.2,
      inStock: false,
      category: "Accessories",
    },
  ],
  isLoading: initialIsLoading = false,
}) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [supplierRating, setSupplierRating] = useState("all");
  const [isLoading, setIsLoading] = useState(initialIsLoading);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      let filtered = [...products];

      if (searchQuery) {
        filtered = filtered.filter(
          (product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (product) =>
            product.category.toLowerCase() === selectedCategory.toLowerCase(),
        );
      }

      filtered = filtered.filter(
        (product) =>
          product.price >= priceRange[0] && product.price <= priceRange[1],
      );

      if (supplierRating !== "all") {
        filtered = filtered.filter(
          (product) => product.supplierRating >= parseInt(supplierRating),
        );
      }

      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [products, searchQuery, selectedCategory, priceRange, supplierRating]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    onPriceRangeChange(range);
  };

  const handleSupplierRatingChange = (rating: string) => {
    setSupplierRating(rating);
    onSupplierRatingChange(rating);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <ProductFilters
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
        onSupplierRatingChange={handleSupplierRatingChange}
      />
      <div className="flex-1 overflow-auto">
        <ProductGrid products={filteredProducts} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ProductCatalog;
