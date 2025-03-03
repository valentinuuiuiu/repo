import React from 'react';
import { 
  Package, 
  Star, 
  ShoppingCart, 
  Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: number;
  name: string;
  supplier: string;
  price: number;
  rating: number;
  image: string;
  categories: string[];
}

const clothingProducts: Product[] = [
  {
    id: 1,
    name: 'Classic Denim Jacket',
    supplier: 'Fashion Forward Imports',
    price: 89.99,
    rating: 4.6,
    image: '/placeholder-product.png',
    categories: ['Clothing', 'Outerwear']
  },
  {
    id: 2,
    name: 'Casual Cotton T-Shirt Set',
    supplier: 'Fashion Forward Imports',
    price: 39.99,
    rating: 4.5,
    image: '/placeholder-product.png',
    categories: ['Clothing', 'Basics']
  },
  {
    id: 3,
    name: 'Stylish Chino Pants',
    supplier: 'Fashion Forward Imports',
    price: 69.99,
    rating: 4.7,
    image: '/placeholder-product.png',
    categories: ['Clothing', 'Bottoms']
  },
  // Add more products
];

const ClothingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Clothing & Apparel</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover trendy and high-quality clothing items from top global suppliers.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Badge variant="secondary">All Clothing</Badge>
          <Badge variant="secondary">Outerwear</Badge>
          <Badge variant="secondary">Basics</Badge>
        </div>
        <div>
          <Button>Sort By</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clothingProducts.map(product => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>{product.rating}</span>
                </div>
                <div className="font-bold text-xl">${product.price}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {product.supplier}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-16">
        <h2 className="text-3xl font-bold mb-6">Expand Your Fashion Collection</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Find the perfect clothing items to enhance your online store's fashion offerings.
        </p>
        <Button size="lg">Connect with Suppliers</Button>
      </div>
    </div>
  );
};

export default ClothingPage;