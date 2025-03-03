import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PriceRangeFilterProps {
  onPriceRangeChange: (range: [number, number]) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ onPriceRangeChange }) => {
  const [range, setRange] = React.useState<[number, number]>([0, 1000]);

  const handleRangeChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setRange(newRange);
    onPriceRangeChange(newRange);
  };

  return (
    <div className="w-[200px] space-y-2">
      <Label>Price Range</Label>
      <Slider
        defaultValue={[0, 1000]}
        max={1000}
        min={0}
        step={10}
        value={range}
        onValueChange={handleRangeChange}
        className="my-4"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>${range[0]}</span>
        <span>${range[1]}</span>
      </div>
    </div>
  );
};

export default PriceRangeFilter;