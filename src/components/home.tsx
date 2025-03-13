import React, { useState, useEffect } from "react";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import ProductCatalog from "./dashboard/ProductCatalog";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "../components/ui/use-toast";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show welcome toast
      toast({
        title: "Welcome to Dropship Platform",
        description:
          "Your dashboard is ready. Start exploring products to add to your store.",
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Expand sidebar on mobile when the component mounts
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Implement search logic here
  };

  const handleCategoryChange = (category: string) => {
    // Implement category filter logic here
    console.log(`Category changed to: ${category}`);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    // Implement price range filter logic here
    console.log(`Price range changed to: ${range[0]} - ${range[1]}`);
  };

  const handleSupplierRatingChange = (rating: string) => {
    // Implement supplier rating filter logic here
    console.log(`Supplier rating changed to: ${rating}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold">Loading your dashboard...</h2>
          <p className="text-muted-foreground">
            Preparing your dropshipping platform
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <DashboardHeader
        userName={userName}
        userAvatar={userAvatar}
        notificationCount={notificationCount}
        onSearch={handleSearch}
      />
      <div className="flex-1 flex">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 p-6 overflow-auto">
          <ProductCatalog
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onSupplierRatingChange={handleSupplierRatingChange}
            products={[
              {
                id: "1",
                title: "Wireless Noise-Cancelling Headphones",
                price: 99.99,
                image:
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                supplierRating: 4.5,
                inStock: true,
                category: "Electronics",
              },
              {
                id: "2",
                title: "Smart Fitness Watch",
                price: 89.99,
                image:
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                supplierRating: 4.8,
                inStock: true,
                category: "Electronics",
              },
              {
                id: "3",
                title: "Premium Laptop Backpack",
                price: 49.99,
                image:
                  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
                supplierRating: 4.2,
                inStock: false,
                category: "Accessories",
              },
              {
                id: "4",
                title: "Ergonomic Wireless Mouse",
                price: 29.99,
                image:
                  "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
                supplierRating: 4.6,
                inStock: true,
                category: "Electronics",
              },
              {
                id: "5",
                title: "Portable Bluetooth Speaker",
                price: 79.99,
                image:
                  "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80",
                supplierRating: 4.3,
                inStock: true,
                category: "Electronics",
              },
              {
                id: "6",
                title: "Premium Phone Case",
                price: 19.99,
                image:
                  "https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800&q=80",
                supplierRating: 3.9,
                inStock: true,
                category: "Accessories",
              },
              {
                id: "7",
                title: "LED Strip Lights",
                price: 24.99,
                image:
                  "https://images.unsplash.com/photo-1586780941528-b7d9a1b5e9a7?w=800&q=80",
                supplierRating: 4.4,
                inStock: true,
                category: "Home",
              },
              {
                id: "8",
                title: "Eco-Friendly Water Bottle",
                price: 34.99,
                image:
                  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
                supplierRating: 4.7,
                inStock: true,
                category: "Lifestyle",
              },
            ]}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;
