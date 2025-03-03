import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    price: number;
    category?: string;
    supplierRating?: number;
    image?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          <img 
            src={product.image || '/images/placeholder-product.svg'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
        </div>
        
        {product.category && (
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="font-bold text-lg">
            ${product.price.toFixed(2)}
          </div>
          {product.supplierRating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{product.supplierRating}</span>
            </div>
          )}
        </div>

        <Button className="w-full mt-4" variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Store
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
