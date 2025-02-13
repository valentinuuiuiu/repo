import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TFunction } from "i18next";

interface ProductFiltersProps {
  onSearch?: (value: string) => void;
  onCategoryChange?: (category: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSupplierRatingChange?: (rating: string) => void;
  t: TFunction<"translation", undefined>;
}

const ProductFilters = ({
  onSearch = () => {},
  onCategoryChange = () => {},
  onPriceRangeChange = () => {},
  onSupplierRatingChange = () => {},
  t,
}: ProductFiltersProps) => {
  return (
    <div className="w-full bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-10">
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('products.searchProducts')}
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={onCategoryChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('products.category')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.allCategories')}</SelectItem>
            <SelectItem value="electronics">{t('products.electronics')}</SelectItem>
            <SelectItem value="clothing">{t('products.clothing')}</SelectItem>
            <SelectItem value="home">{t('products.homeAndGarden')}</SelectItem>
            <SelectItem value="beauty">{t('products.beauty')}</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t('products.filters')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{t('products.priceRange')}</h4>
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={1}
                  onValueChange={(value) =>
                    onPriceRangeChange(value as [number, number])
                  }
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">{t('products.supplierRating')}</h4>
                <Select
                  onValueChange={onSupplierRatingChange}
                  defaultValue="all"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.selectMinRating')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('products.allRatings')}</SelectItem>
                    <SelectItem value="4">{t('products.4Stars')}</SelectItem>
                    <SelectItem value="3">{t('products.3Stars')}</SelectItem>
                    <SelectItem value="2">{t('products.2Stars')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ProductFilters;
