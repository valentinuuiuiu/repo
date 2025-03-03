import React, { useState } from 'react';
import { 
  Globe, 
  Package, 
  Star, 
  CheckCircle, 
  ShoppingCart, 
  Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Chatbot from '@/components/chatbot/Chatbot';

interface Supplier {
  id: number;
  name: string;
  country: string;
  description: string;
  rating: number;
  productsCount: number;
  verified: boolean;
  logo: string;
  categories: string[];
  specialties: string[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  categories: string[];
}

const supplierData: Supplier = {
  id: 1,
  name: 'Global Trends Wholesale',
  country: 'China',
  description: 'Leading global supplier of cutting-edge electronics and innovative gadgets with a focus on dropshipping and fast international shipping.',
  rating: 4.7,
  productsCount: 5000,
  verified: true,
  logo: '/images/placeholder-supplier-logo.svg',
  categories: ['Electronics', 'Gadgets', 'Smart Home'],
  specialties: ['Dropshipping', 'Fast Shipping', 'Low MOQ']
};

const supplierProducts: Product[] = [
  {
    id: 1,
    name: '4K Ultra HD Smart TV',
    price: 349.99,
    rating: 4.5,
    image: '/images/placeholder-product.svg',
    categories: ['Electronics', 'Smart Home']
  },
  {
    id: 2,
    name: 'Wireless Noise-Cancelling Headphones',
    price: 129.99,
    rating: 4.7,
    image: '/images/placeholder-product.svg',
    categories: ['Electronics', 'Gadgets']
  },
  {
    id: 3,
    name: 'Smart Home Security Camera',
    price: 89.99,
    rating: 4.6,
    image: '/images/placeholder-product.svg',
    categories: ['Electronics', 'Smart Home']
  },
  // Add more products
];

const SupplierDetailPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory 
    ? supplierProducts.filter(product => product.categories.includes(selectedCategory))
    : supplierProducts;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Chatbot Component */}
      <Chatbot 
        initialMessage={`Hello! I'm DropConnect's AI assistant. I can help you with information about ${supplierData.name} and their products.`}
        contextData={{
          supplierName: supplierData.name,
          supplierCategory: supplierData.categories,
          supplierCountry: supplierData.country
        }}
      />
      
      {/* Supplier Overview */}
      <div className="flex flex-col md:flex-row items-center mb-16 space-y-6 md:space-y-0 md:space-x-12">
        <div className="w-48 h-48 bg-muted rounded-full flex items-center justify-center">
          <img 
            src={supplierData.logo} 
            alt={`${supplierData.name} logo`} 
            className="w-40 h-40 object-contain"
          />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-bold mb-4">{supplierData.name}</h1>
          <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2 text-muted-foreground" />
              <span>{supplierData.country}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              <span>{supplierData.rating}</span>
            </div>
            {supplierData.verified && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Verified
              </div>
            )}
          </div>
          <p className="text-muted-foreground mb-6">{supplierData.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
            {supplierData.categories.map(category => (
              <Badge key={category} variant="secondary">{category}</Badge>
            ))}
          </div>
          <div className="flex justify-center md:justify-start space-x-4">
            <Button>Contact Supplier</Button>
            <Button variant="outline">Request Catalog</Button>
          </div>
        </div>
      </div>

      {/* Supplier Specialties */}
      <div className="bg-muted/30 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Supplier Specialties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supplierData.specialties.map(specialty => (
            <div key={specialty} className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold">{specialty}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Product Catalog */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center">Product Catalog</h2>
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
            >
              All Products
            </Button>
            {supplierData.categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
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
                  <div className="flex space-x-2">
                    {product.categories.map(category => (
                      <Badge key={category} variant="secondary" size="sm">{category}</Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline">
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16 bg-primary/10 rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-6">Interested in This Supplier?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Connect with {supplierData.name} and start dropshipping their products today.
        </p>
        <div className="flex justify-center space-x-4">
          <Button size="lg">Request Partnership</Button>
          <Button size="lg" variant="outline">Download Catalog</Button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetailPage;