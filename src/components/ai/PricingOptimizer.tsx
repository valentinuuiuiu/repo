import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Zap, ArrowUp, ArrowDown, DollarSign, PieChart, Info, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropshippingAgentHub,
  PricingRecommendation
} from './DropshippingAgentHub';

// Example product data interface
interface ProductData {
  id: string;
  name: string;
  cost: number;
  currentPrice: number;
  competitors: Record<string, number>;
}

// Component to optimize product pricing using AI
export const PricingOptimizer: React.FC = () => {
  const agentHub = DropshippingAgentHub();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [results, setResults] = useState<PricingRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading products - in a real app this would come from your API
  useEffect(() => {
    const mockProducts: ProductData[] = [
      {
        id: '1',
        name: 'Wireless Earbuds',
        cost: 15.50,
        currentPrice: 39.99,
        competitors: {
          'Amazon': 42.99,
          'Walmart': 38.95,
          'eBay': 35.99
        }
      },
      {
        id: '2',
        name: 'Smart Watch',
        cost: 35.25,
        currentPrice: 79.99,
        competitors: {
          'Amazon': 89.99,
          'Walmart': 84.95,
          'eBay': 74.99
        }
      },
      {
        id: '3',
        name: 'Portable Charger',
        cost: 12.75,
        currentPrice: 29.99,
        competitors: {
          'Amazon': 32.99,
          'Walmart': 27.95,
          'eBay': 25.99
        }
      },
      {
        id: '4',
        name: 'Bluetooth Speaker',
        cost: 22.30,
        currentPrice: 59.99,
        competitors: {
          'Amazon': 64.99,
          'Walmart': 57.95
        }
      }
    ];
    
    setProducts(mockProducts);
  }, []);
  
  // Function to generate pricing recommendations using AI
  const generatePricingRecommendations = useCallback(async () => {
    if (products.length === 0) {
      setError('No products available for analysis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the agent hub to get pricing recommendations
      const recommendations = await agentHub.generatePricingRecommendations(products);
      setResults(recommendations);
    } catch (err) {
      console.error('Error generating pricing recommendations:', err);
      setError('Failed to generate pricing recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [agentHub, products]);
  
  // Helper function to determine profit change
  const calculateProfitChange = (product: ProductData, recommendation: PricingRecommendation) => {
    const currentProfit = product.currentPrice - product.cost;
    const recommendedProfit = recommendation.recommendedPrice - product.cost;
    const change = recommendedProfit - currentProfit;
    const percentChange = (change / currentProfit) * 100;
    
    return {
      change,
      percentChange,
      isPositive: change > 0
    };
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            AI Pricing Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your product pricing strategy with AI market analysis and competitor insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Product Analysis Status</h3>
                <p className="text-sm text-muted-foreground">
                  {products.length} products ready for AI price optimization
                </p>
              </div>
              <Button 
                onClick={generatePricingRecommendations} 
                disabled={isLoading || products.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Optimize Pricing
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing market data...</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Pricing Recommendations</CardTitle>
            <CardDescription>
              These recommendations are based on market research, competitor analysis, and sales data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="comparison">Competitor Comparison</TabsTrigger>
                <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommendations" className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Recommended</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((recommendation) => {
                      const product = products.find(p => p.id === recommendation.productId)!;
                      const priceDiff = recommendation.recommendedPrice - product.currentPrice;
                      const percentChange = (priceDiff / product.currentPrice) * 100;
                      
                      return (
                        <TableRow key={recommendation.productId}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>${product.currentPrice.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">${recommendation.recommendedPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {priceDiff > 0 ? (
                                <ArrowUp className={`h-4 w-4 text-green-600`} />
                              ) : priceDiff < 0 ? (
                                <ArrowDown className={`h-4 w-4 text-amber-600`} />
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                              <span className={priceDiff > 0 ? 'text-green-600' : priceDiff < 0 ? 'text-amber-600' : ''}>
                                {priceDiff !== 0 && (priceDiff > 0 ? '+' : '')}{percentChange.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <div className="w-16 bg-gray-100 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${recommendation.confidence * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{(recommendation.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="comparison" className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Your Price</TableHead>
                      <TableHead>Market Avg</TableHead>
                      <TableHead>Lowest Price</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((recommendation) => {
                      const product = products.find(p => p.id === recommendation.productId)!;
                      const competitors = product.competitors;
                      const competitorPrices = Object.values(competitors);
                      const avgPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
                      const minPrice = Math.min(...competitorPrices);
                      const position = recommendation.recommendedPrice <= minPrice ? 'Lowest' : 
                                      recommendation.recommendedPrice <= avgPrice ? 'Below Avg' : 'Above Avg';
                      
                      return (
                        <TableRow key={recommendation.productId}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>${recommendation.recommendedPrice.toFixed(2)}</TableCell>
                          <TableCell>${avgPrice.toFixed(2)}</TableCell>
                          <TableCell>${minPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={
                              position === 'Lowest' ? 'bg-green-100 text-green-800' :
                              position === 'Below Avg' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {position}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="profit" className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Current Profit</TableHead>
                      <TableHead>Recommended Profit</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((recommendation) => {
                      const product = products.find(p => p.id === recommendation.productId)!;
                      const currentProfit = product.currentPrice - product.cost;
                      const { change, percentChange, isPositive } = calculateProfitChange(product, recommendation);
                      
                      return (
                        <TableRow key={recommendation.productId}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>${product.cost.toFixed(2)}</TableCell>
                          <TableCell>${currentProfit.toFixed(2)}</TableCell>
                          <TableCell>${recommendation.potentialProfit.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isPositive ? (
                                <ArrowUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-amber-600" />
                              )}
                              <span className={isPositive ? 'text-green-600' : 'text-amber-600'}>
                                {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Reset</Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>AI Confidence Score: 87%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    This score represents the AI's confidence in these recommendations based on 
                    market data quality, competitor analysis, and pricing patterns
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button>Apply Recommended Prices</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};