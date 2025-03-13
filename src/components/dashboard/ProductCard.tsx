import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Star, ShoppingCart, TrendingUp, Eye } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ProductCardProps {
  id?: string;
  title?: string;
  price?: number;
  image?: string;
  supplierRating?: number;
  inStock?: boolean;
  category?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id = "sample-id",
  title = "Sample Product Name",
  price = 29.99,
  image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  supplierRating = 4.5,
  inStock = true,
  category = "Electronics",
}) => {
  const handleViewDetails = () => {
    const event = new CustomEvent("toast", {
      detail: {
        title: "Product Details",
        description: `Viewing details for ${title}`,
        variant: "default",
      },
    });
    document.dispatchEvent(event);
  };

  const handleAddToStore = () => {
    const event = new CustomEvent("toast", {
      detail: {
        title: "Product Added",
        description: `${title} has been added to your store!`,
        variant: "default",
      },
    });
    document.dispatchEvent(event);
  };

  const handleViewAnalytics = () => {
    const event = new CustomEvent("toast", {
      detail: {
        title: "Analytics",
        description: `Viewing analytics for ${title}`,
        variant: "default",
      },
    });
    document.dispatchEvent(event);
  };

  return (
    <Card className="w-[300px] h-[400px] bg-white overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <Badge
            className="absolute top-2 right-2"
            variant={inStock ? "default" : "destructive"}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            {category}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-bold">${price.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{supplierRating}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex-1"
                variant="default"
                onClick={handleAddToStore}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Store
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import this product to your store</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleViewDetails}>
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View product details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleViewAnalytics}
              >
                <TrendingUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View product analytics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
