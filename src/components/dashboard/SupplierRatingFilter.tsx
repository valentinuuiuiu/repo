import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from 'lucide-react';

interface SupplierRatingFilterProps {
  onSupplierRatingChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ratings = [
  { value: 'any', label: 'Any Rating' }, // Changed from empty string to 'any'
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
  { value: '2', label: '2+ Stars' },
  { value: '1', label: '1+ Stars' },
];

const SupplierRatingFilter: React.FC<SupplierRatingFilterProps> = ({ onSupplierRatingChange }) => {
  return (
    <Select onValueChange={(value) => onSupplierRatingChange({ target: { value } } as any)}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Filter by Rating" />
      </SelectTrigger>
      <SelectContent>
        {ratings.map((rating) => (
          <SelectItem key={rating.value} value={rating.value}>
            <div className="flex items-center">
              {rating.value !== 'any' ? (
                <>
                  <span className="mr-2">{rating.value}+</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </>
              ) : (
                rating.label
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SupplierRatingFilter;