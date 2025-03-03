import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Globe, 
  Check, 
  Search, 
  BarChart2, 
  Link2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Platform } from '@/types/platform';

// Mock Platforms Data
const mockPlatforms: Platform[] = [
  {
    id: 1,
    name: 'Shopify',
    logo: '/placeholder-platform-logo.png',
    description: 'Leading e-commerce platform for online stores and retail point of sale systems.',
    features: ['Multi-channel selling', 'Advanced analytics', 'App ecosystem'],
    pricing: {
      basic: '$29/month',
      advanced: '$79/month',
      enterprise: 'Custom'
    },
    integrationSupport: true,
    marketplaces: ['US', 'Canada', 'UK', 'Australia']
  },
  {
    id: 2,
    name: 'WooCommerce',
    logo: '/placeholder-platform-logo.png',
    description: 'Open-source e-commerce plugin for WordPress, offering flexibility and customization.',
    features: ['WordPress integration', 'Extensive plugins', 'Free base platform'],
    pricing: {
      basic: 'Free',
      advanced: '$99/year',
      enterprise: 'Custom'
    },
    integrationSupport: true,
    marketplaces: ['Global', 'Europe', 'North America']
  },
  {
    id: 3,
    name: 'eBay',
    logo: '/placeholder-platform-logo.png',
    description: 'Global online marketplace connecting millions of buyers and sellers worldwide.',
    features: ['Massive user base', 'International reach', 'Auction and fixed price'],
    pricing: {
      basic: 'Free listing',
      advanced: '10-15% commission',
      enterprise: 'Custom rates'
    },
    integrationSupport: true,
    marketplaces: ['Global', 'US', 'UK', 'Germany']
  },
  {
    id: 4,
    name: 'Amazon',
    logo: '/placeholder-platform-logo.png',
    description: "World's largest e-commerce platform with extensive fulfillment and marketing services.",
    features: ['FBA', 'Prime shipping', 'Global marketplace'],
    pricing: {
      basic: 'Individual: $0.99/item',
      advanced: 'Professional: $39.99/month',
      enterprise: 'Custom'
    },
    integrationSupport: true,
    marketplaces: ['Global', 'US', 'EU', 'Japan']
  }
];

const PlatformsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);

  // Use type assertion for Set conversion
  const allMarketplaces: string[] = Array.from(
    new Set(mockPlatforms.flatMap(p => p.marketplaces))
  );

  const filteredPlatforms: Platform[] = mockPlatforms.filter(platform => 
    platform.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedMarketplaces.length === 0 || 
     selectedMarketplaces.some(market => platform.marketplaces.includes(market)))
  );

  const handleMarketplaceToggle = (marketplace: string): void => {
    setSelectedMarketplaces(prev => 
      prev.includes(marketplace) 
        ? prev.filter(m => m !== marketplace) 
        : [...prev, marketplace]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Sell Everywhere, Manage Everything</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Seamlessly connect and manage your sales across multiple e-commerce platforms with DropConnect.
        </p>
      </div>

      <div className="mb-12 flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search platforms" 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {allMarketplaces.map(marketplace => (
            <Badge 
              key={marketplace} 
              variant={selectedMarketplaces.includes(marketplace) ? 'default' : 'outline'}
              onClick={() => handleMarketplaceToggle(marketplace)}
              className="cursor-pointer"
            >
              {marketplace}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlatforms.map(platform => (
              <Card key={platform.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <img 
                      src={platform.logo} 
                      alt={`${platform.name} logo`} 
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <CardTitle>{platform.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="w-4 h-4 mr-2" />
                      Multi-Marketplace
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {platform.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <BarChart2 className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-semibold">Pricing</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted rounded p-2 text-center">
                        <span className="block text-sm font-bold">Basic</span>
                        <span className="text-xs">{platform.pricing.basic}</span>
                      </div>
                      <div className="bg-muted rounded p-2 text-center">
                        <span className="block text-sm font-bold">Advanced</span>
                        <span className="text-xs">{platform.pricing.advanced}</span>
                      </div>
                      <div className="bg-muted rounded p-2 text-center">
                        <span className="block text-sm font-bold">Enterprise</span>
                        <span className="text-xs">{platform.pricing.enterprise}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Link2 className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-semibold">Key Features</span>
                    </div>
                    <div className="space-y-2">
                      {platform.features.map(feature => (
                        <div key={feature} className="flex items-center">
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Globe className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-semibold">Marketplaces</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {platform.marketplaces.map(marketplace => (
                        <Badge key={marketplace} variant="secondary">{marketplace}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Connect Platform
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recommended">
          <div className="text-center py-16 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Personalized Platform Recommendations</h2>
            <p className="text-muted-foreground mb-6">
              We'll analyze your business needs and suggest the best platforms for you.
            </p>
            <Button>Get Recommendations</Button>
          </div>
        </TabsContent>
        <TabsContent value="trending">
          <div className="text-center py-16 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Trending Platforms Coming Soon</h2>
            <p className="text-muted-foreground">
              Stay tuned for real-time insights into the most popular e-commerce platforms.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center bg-primary/10 rounded-xl p-12">
        <h2 className="text-3xl font-bold mb-6">Expand Your Sales Channels</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Connect multiple platforms, manage inventory, and scale your business effortlessly.
        </p>
        <Button size="lg">Start Connecting</Button>
      </div>
    </div>
  );
};

export default PlatformsPage;