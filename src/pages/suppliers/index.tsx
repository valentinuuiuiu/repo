import React, { useState } from 'react';
import { 
  Globe, 
  Package, 
  ShoppingCart, 
  Star, 
  Search, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Supplier } from '@/types/supplier';

// Mock Supplier Data
const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Global Trends Wholesale',
    country: 'China',
    categories: ['Electronics', 'Gadgets'],
    rating: 4.7,
    productsCount: 5000,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Leading global supplier of cutting-edge electronics and innovative gadgets.',
    specialties: ['Dropshipping', 'Fast Shipping', 'Low MOQ']
  },
  {
    id: 2,
    name: 'Fashion Forward Imports',
    country: 'Vietnam',
    categories: ['Clothing', 'Accessories'],
    rating: 4.5,
    productsCount: 3500,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Premier supplier of trendy fashion items and accessories for online retailers.',
    specialties: ['Latest Trends', 'Custom Packaging', 'Quick Turnaround']
  },
  {
    id: 3,
    name: 'Home & Living Essentials',
    country: 'India',
    categories: ['Home Decor', 'Kitchen', 'Furniture'],
    rating: 4.3,
    productsCount: 2800,
    verified: false,
    logo: '/placeholder-supplier-logo.png',
    description: 'Comprehensive supplier of home goods and living essentials.',
    specialties: ['Wide Range', 'Competitive Pricing', 'Bulk Discounts']
  },
  {
    id: 4,
    name: 'Tech Innovations Supplier',
    country: 'South Korea',
    categories: ['Electronics', 'Gadgets', 'Smart Home'],
    rating: 4.8,
    productsCount: 4200,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Cutting-edge technology and smart home solutions for modern retailers.',
    specialties: ['Latest Tech', 'Innovative Products', 'Global Shipping']
  }
];

const SuppliersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories: string[] = Array.from(new Set(mockSuppliers.flatMap(s => s.categories)));

  const filteredSuppliers: Supplier[] = mockSuppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategories.length === 0 || 
     selectedCategories.some(cat => supplier.categories.includes(cat)))
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Global Supplier Network</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with verified suppliers across multiple categories, ready to power your dropshipping business.
        </p>
      </div>

      <div className="mb-12 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search suppliers by name" 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge 
              key={category} 
              variant={selectedCategories.includes(category) ? 'default' : 'outline'}
              onClick={() => 
                setSelectedCategories(prev => 
                  prev.includes(category) 
                    ? prev.filter(c => c !== category) 
                    : [...prev, category]
                )
              }
              className="cursor-pointer"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="verified">Verified Suppliers</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <img 
                      src={supplier.logo} 
                      alt={`${supplier.name} logo`} 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle>{supplier.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 mr-2" />
                      {supplier.country}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span>{supplier.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      <span>{supplier.productsCount} Products</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {supplier.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.categories.map(category => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center mb-4">
                    {supplier.verified ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Verified Supplier
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Not Verified
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="w-full">View Details</Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="verified">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSuppliers.filter(s => s.verified).map(supplier => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <img 
                      src={supplier.logo} 
                      alt={`${supplier.name} logo`} 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle>{supplier.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 mr-2" />
                      {supplier.country}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span>{supplier.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      <span>{supplier.productsCount} Products</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {supplier.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.categories.map(category => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center mb-4">
                    {supplier.verified ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Verified Supplier
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Not Verified
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="w-full">View Details</Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="trending">
          <div className="text-center py-16 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Trending Suppliers Coming Soon</h2>
            <p className="text-muted-foreground">
              We're working on bringing you the most trending suppliers in real-time.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Expand Your Supply Chain?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join DropConnect and connect with global suppliers instantly.
        </p>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
};

export default SuppliersPage;