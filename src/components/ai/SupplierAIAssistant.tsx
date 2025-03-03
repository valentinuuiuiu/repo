import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  DropshippingAgentHub,
  SupplierMatchCriteria,
  PricingRecommendation
} from './DropshippingAgentHub';

// Component to assist with supplier selection using AI
export const SupplierAIAssistant: React.FC = () => {
  const agentHub = DropshippingAgentHub();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for supplier criteria
  const [productType, setProductType] = useState('');
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(100);
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState(4);
  const [maxShippingDays, setMaxShippingDays] = useState(14);
  const [keywords, setKeywords] = useState('');
  
  const handleFindSuppliers = useCallback(async () => {
    if (!productType || !location) {
      setError('Product type and location are required fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const criteria: SupplierMatchCriteria = {
        productType,
        priceRange: [minPrice, maxPrice],
        location,
        minimumRating: minRating,
        shippingTimeMaxDays: maxShippingDays,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      };
      
      const supplierRecommendations = await agentHub.findOptimalSuppliers(criteria);
      setResults(supplierRecommendations);
    } catch (err) {
      console.error('Error finding suppliers:', err);
      setError('Failed to find suppliers. Please try again with different criteria.');
    } finally {
      setIsLoading(false);
    }
  }, [
    agentHub, productType, minPrice, maxPrice, 
    location, minRating, maxShippingDays, keywords
  ]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Supplier Finder</CardTitle>
          <CardDescription>
            Use AI to find the best suppliers for your products across multiple platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productType">Product Type</Label>
                <Input 
                  id="productType" 
                  placeholder="e.g. Men's Clothing, Electronics" 
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Supplier Location</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. China, USA, Europe"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Price Range (${minPrice} - ${maxPrice})</Label>
              <div className="pt-2">
                <Slider
                  defaultValue={[minPrice, maxPrice]}
                  min={1}
                  max={1000}
                  step={1}
                  onValueChange={(values) => {
                    setMinPrice(values[0]);
                    setMaxPrice(values[1]);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Rating ({minRating}/5)</Label>
              <div className="pt-2">
                <Slider
                  defaultValue={[minRating]}
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={(values) => setMinRating(values[0])}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Maximum Shipping Days ({maxShippingDays})</Label>
              <div className="pt-2">
                <Slider
                  defaultValue={[maxShippingDays]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={(values) => setMaxShippingDays(values[0])}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma separated)</Label>
              <Input 
                id="keywords" 
                placeholder="e.g. sustainable, cotton, waterproof"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleFindSuppliers} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Suppliers...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Optimal Suppliers
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Recommended Suppliers</CardTitle>
            <CardDescription>
              Based on your criteria and current market conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This is a mock representation - in production, map over actual results */}
              {[1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold flex items-center">
                      Supplier {index}
                      {index <= 2 && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          Recommended
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {index === 1 ? 'Aliexpress' : index === 2 ? 'Alibaba' : 'TEMU'} • {location}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <span key={i} className={`text-sm ${i < minRating ? 'text-amber-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                      <span className="text-sm ml-1">({(4 + Math.random()).toFixed(1)})</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Ships in:</span> {Math.floor(Math.random() * maxShippingDays) + 1} days
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium">Price Range</p>
                      <p className="text-lg font-bold">
                        ${(minPrice + Math.random() * (maxPrice - minPrice)).toFixed(2)} - 
                        ${(maxPrice - Math.random() * 10).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="mt-2">
                      <Badge className={index <= 2 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                        {index <= 2 ? "Excellent" : "Good"} match
                      </Badge>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{index <= 2 ? "High" : "Moderate"} match with trends</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium">Market Insights</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  AI analysis suggests that suppliers from {location} offering {productType} 
                  have shown consistent reliability with shipping times under {maxShippingDays} days.
                  The current price range is competitive in the market.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Save Results</Button>
            <Button variant="outline">Export as CSV</Button>
            <Button>Contact Selected Suppliers</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};