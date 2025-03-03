import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import PriceRangeFilter from './PriceRangeFilter';
import SupplierRatingFilter from './SupplierRatingFilter';

interface ProductCatalogProps {
  products: Product[];
  isLoading: boolean;
  onSearch: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onSupplierRatingChange: (rating: string) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  products, 
  isLoading, 
  onSearch, 
  onCategoryChange, 
  onPriceRangeChange, 
  onSupplierRatingChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [supplierRating, setSupplierRating] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
    onCategoryChange(event.target.value);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    onPriceRangeChange(range);
  };

  const handleSupplierRatingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSupplierRating(event.target.value);
    onSupplierRatingChange(event.target.value);
  };

  const filteredProducts = products.filter(product => {
    const searchMatch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = category ? product.status === category : true;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    const ratingMatch = supplierRating ? (product.supplierRating !== undefined && product.supplierRating !== null ? product.supplierRating >= parseFloat(supplierRating) : false) : true;

    return searchMatch && categoryMatch && priceMatch && ratingMatch;
  });

  return (
    <div className="product-catalog space-y-6">
      <div className="filters flex flex-wrap gap-4">
        <SearchBar onSearchChange={handleSearchChange} />
        <CategoryFilter onCategoryChange={handleCategoryChange} />
        <PriceRangeFilter onPriceRangeChange={handlePriceRangeChange} />
        <SupplierRatingFilter onSupplierRatingChange={handleSupplierRatingChange} />
      </div>
      <div className="products grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <p>Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                name: product.title,
                price: product.price,
                category: product.status,
                supplierRating: product.supplierRating ?? undefined,
                image: product.image || undefined
              }} 
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
