import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Star, ShoppingCart, TrendingUp } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { TFunction } from "i18next";

interface ProductCardProps {
  title?: string;
  price?: number;
  image?: string;
  supplierRating?: number;
  inStock?: boolean;
  category?: string;
  t: TFunction<"translation", undefined>;
}

const ProductCard = ({
  title = "Sample Product Name",
  price = 29.99,
  image = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  supplierRating = 4.5,
  inStock = true,
  category = "Electronics",
  t,
}: ProductCardProps) => {
  console.log("t prop in ProductCard:", typeof t);
  return (
    <Card className="w-[300px] h-[400px] bg-white overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <Badge
            className="absolute top-2 right-2"
            variant={inStock ? "default" : "destructive"}
          >
            {inStock ? t('products.inStock') : t('products.outOfStock')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            {t(category)}
          </Badge>
          <h3 className="font-semibold text-lg line-clamp-2">{t(title)}</h3>
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
              <Button className="flex-1" variant="default">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('products.addToStore')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('products.importToStore')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <TrendingUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('products.viewAnalytics')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
