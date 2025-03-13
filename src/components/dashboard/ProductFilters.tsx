import React, { useState } from "react";
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
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";

interface ProductFiltersProps {
  onSearch?: (value: string) => void;
  onCategoryChange?: (category: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onSupplierRatingChange?: (rating: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  onSearch = () => {},
  onCategoryChange = () => {},
  onPriceRangeChange = () => {},
  onSupplierRatingChange = () => {},
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [supplierRating, setSupplierRating] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
    updateActiveFilters("search", value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange(value);
    updateActiveFilters("category", value);
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    onPriceRangeChange(value);
    updateActiveFilters("price", `${value[0]} - ${value[1]}`);
  };

  const handleSupplierRatingChange = (value: string) => {
    setSupplierRating(value);
    onSupplierRatingChange(value);
    updateActiveFilters("rating", value);
  };

  const updateActiveFilters = (type: string, value: string) => {
    if (type === "search" && !value) {
      setActiveFilters(activeFilters.filter((f) => !f.startsWith("Search:")));
      return;
    }

    if (type === "category" && value === "all") {
      setActiveFilters(activeFilters.filter((f) => !f.startsWith("Category:")));
      return;
    }

    if (type === "rating" && value === "all") {
      setActiveFilters(activeFilters.filter((f) => !f.startsWith("Rating:")));
      return;
    }

    const newFilter = {
      search: `Search: ${value}`,
      category: `Category: ${value}`,
      price: `Price: ${value}`,
      rating: `Rating: ${value}+`,
    }[type];

    if (!newFilter) return;

    const filterExists = activeFilters.some((f) =>
      f.startsWith(`${type.charAt(0).toUpperCase() + type.slice(1)}:`),
    );

    if (filterExists) {
      setActiveFilters(
        activeFilters.map((f) =>
          f.startsWith(`${type.charAt(0).toUpperCase() + type.slice(1)}:`)
            ? newFilter
            : f,
        ),
      );
    } else {
      setActiveFilters([...activeFilters, newFilter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));

    if (filter.startsWith("Search:")) {
      setSearchValue("");
      onSearch("");
    } else if (filter.startsWith("Category:")) {
      setCategory("all");
      onCategoryChange("all");
    } else if (filter.startsWith("Price:")) {
      setPriceRange([0, 1000]);
      onPriceRangeChange([0, 1000]);
    } else if (filter.startsWith("Rating:")) {
      setSupplierRating("all");
      onSupplierRatingChange("all");
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchValue("");
    setCategory("all");
    setPriceRange([0, 1000]);
    setSupplierRating("all");
    onSearch("");
    onCategoryChange("all");
    onPriceRangeChange([0, 1000]);
    onSupplierRatingChange("all");
  };

  return (
    <div className="w-full bg-white border-b p-4 flex flex-col gap-4 sticky top-0 z-10">
      <div className="flex-1 flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="home">Home & Garden</SelectItem>
            <SelectItem value="beauty">Beauty</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Price Range</h4>
                <Slider
                  value={priceRange}
                  max={1000}
                  step={1}
                  onValueChange={(value) =>
                    handlePriceRangeChange(value as [number, number])
                  }
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}+</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Supplier Rating</h4>
                <Select
                  value={supplierRating}
                  onValueChange={handleSupplierRatingChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select minimum rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
