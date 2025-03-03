import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Package, ShoppingCart, Users, Store, Globe, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";
import ProductCatalog from "@/components/dashboard/ProductCatalog";
import { productService } from "@/lib/api/products";
import type { Product as PrismaProduct } from "@prisma/client";

// Extended product interface including the fields our component needs
interface Product extends Omit<PrismaProduct, 'images'> {
  image: string;
  supplierRating: number;
  inStock: boolean;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const platformFeatures = [
    {
      title: "Supplier Integration",
      description: "Connect with Alibaba, AliExpress, Temu and more with one-click integrations",
      icon: <Package className="h-10 w-10 text-primary" />,
    },
    {
      title: "Multi-Channel Selling",
      description: "Sync inventory and orders across Shopify, WooCommerce, eBay, and more",
      icon: <Store className="h-10 w-10 text-primary" />,
    },
    {
      title: "Automated Fulfillment",
      description: "Orders automatically routed to suppliers for direct shipping to customers",
      icon: <Zap className="h-10 w-10 text-primary" />,
    },
    {
      title: "Global Reach",
      description: "Access international suppliers and sell to customers worldwide",
      icon: <Globe className="h-10 w-10 text-primary" />,
    },
    {
      title: "Business Analytics",
      description: "Track performance, identify trends, and optimize your product selection",
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
    },
    {
      title: "Secure Transactions",
      description: "Protected payments and verified suppliers for peace of mind",
      icon: <Shield className="h-10 w-10 text-primary" />,
    },
  ];

  const testimonials = [
    {
      quote: "DropConnect helped me scale my Shopify store from $2K to $45K monthly revenue in just 6 months.",
      author: "Sarah T.",
      business: "Fashion Accessories Store",
    },
    {
      quote: "The platform made it incredibly easy to find reliable suppliers and automate my entire fulfillment process.",
      author: "Michael R.",
      business: "Home Goods Retailer",
    },
    {
      quote: "I was able to expand from just eBay to five different marketplaces thanks to DropConnect's multi-channel tools.",
      author: "Jessica L.",
      business: "Electronics Dropshipper",
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (filters = {}) => {
    try {
      setIsLoading(true);
      const response = await productService.list({
        ...filters,
        page: 1,
        limit: 20
      });
      
      const transformedProducts = response.products.map((product: any) => ({
        ...product,
        image: product.images?.[0] || '/images/placeholder-product.svg',
        supplierRating: product.supplier?.rating || 0,
        inStock: product.inventory ? product.inventory > 0 : true
      })) as Product[];
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    loadProducts({ search: value });
  };

  const handleCategoryChange = (category: string) => {
    loadProducts({ category });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    loadProducts({ minPrice: range[0], maxPrice: range[1] });
  };

  const handleSupplierRatingChange = (rating: string) => {
    loadProducts({ minRating: parseFloat(rating) });
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Connect Suppliers to <span className="text-primary">Any Platform</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                The complete dropshipping solution that empowers small business owners to source products globally and sell everywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-md">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="text-md">
                  Watch Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Trusted by 10,000+ businesses worldwide
                </p>
                <div className="flex flex-wrap gap-6 mt-4 opacity-70">
                  {/* Placeholder for partner logos */}
                  <div className="h-8 w-24 bg-muted rounded"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-muted rounded-lg shadow-xl overflow-hidden">
                {/* Placeholder for hero image/video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Platform Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our end-to-end platform connects every aspect of your dropshipping business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="border border-border hover:shadow-md transition-all">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <ProductCatalog
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onSupplierRatingChange={handleSupplierRatingChange}
            products={products}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How DropConnect Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">Connect Suppliers</h3>
              <p className="text-muted-foreground">Integrate with global suppliers from Alibaba, AliExpress, Temu and more with our one-click setup.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">Set Up Sales Channels</h3>
              <p className="text-muted-foreground">Link your Shopify, WooCommerce, eBay, or other marketplace accounts to our platform.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Automate & Scale</h3>
              <p className="text-muted-foreground">Let our system handle order routing, inventory updates, and fulfillment while you focus on growth.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button size="lg">
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how businesses like yours are thriving with our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-primary/5 border-none">
                <CardContent className="pt-6">
                  <div className="mb-4 text-4xl text-primary">"</div>
                  <p className="mb-6 italic">{testimonial.quote}</p>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Dropshipping Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful entrepreneurs who are scaling their businesses with DropConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-md">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-md">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;