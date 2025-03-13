import React from "react";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  supplierRating: number;
  inStock: boolean;
  category: string;
}

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
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
    {
      id: "4",
      title: "Wireless Mouse",
      price: 29.99,
      image:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
      supplierRating: 4.6,
      inStock: true,
      category: "Electronics",
    },
  ],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 p-6 flex justify-center items-center h-64">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
        {products.map((product) => (
          <div key={product.id} className="flex justify-center">
            <ProductCard
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
              supplierRating={product.supplierRating}
              inStock={product.inStock}
              category={product.category}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
