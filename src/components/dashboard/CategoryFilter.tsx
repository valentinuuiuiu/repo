import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  onCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onCategoryChange }) => {
  return (
    <Select onValueChange={(value) => onCategoryChange({ target: { value } } as any)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;