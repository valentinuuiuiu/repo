import React, { useState } from "react";
import ProductCatalog from "./dashboard/ProductCatalog";

interface HomeProps {
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

const Home = ({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  notificationCount = 3,
}: HomeProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Implement search logic here
  };

  const handleCategoryChange = (category: string) => {
    // Implement category filter logic here
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    // Implement price range filter logic here
  };

  const handleSupplierRatingChange = (rating: string) => {
    // Implement supplier rating filter logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col flex-1">
      <main className="flex-1 p-6 overflow-auto w-full">
        <ProductCatalog
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={handlePriceRangeChange}
          onSupplierRatingChange={handleSupplierRatingChange}
          products={[
            {
              id: "1",
              title: "Wireless Headphones",
              price: 99.99,
              image:
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
              supplierRating: 4.5,
              inStock: true,
              category: "Electronics",
            },
            {
              id: "2",
              title: "Smart Watch",
              price: 199.99,
              image:
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
              supplierRating: 4.8,
              inStock: true,
              category: "Electronics",
            },
            {
              id: "3",
              title: "Laptop Backpack",
              price: 49.99,
              image:
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
              supplierRating: 4.2,
              inStock: false,
              category: "Accessories",
            },
            {
              id: "4",
              title: "Wireless Mouse",
              price: 29.99,
              image:
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
              supplierRating: 4.6,
              inStock: true,
              category: "Electronics",
            },
          ]}
        />
      </main>
    </div>
  );
};

export default Home;
