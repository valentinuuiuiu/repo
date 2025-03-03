import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code2,
  BookOpen,
  Key,
  Lock,
  Server,
  RefreshCcw,
  ShoppingCart,
  Package,
  Truck
} from 'lucide-react';

const ApiDocsPage = () => {
  const [activeVersion, setActiveVersion] = useState('v1');

  const endpoints = {
    products: [
      {
        method: 'GET',
        path: '/api/v1/products',
        description: 'List all products',
        authentication: 'Bearer Token',
        parameters: [
          { name: 'page', type: 'number', description: 'Page number for pagination' },
          { name: 'limit', type: 'number', description: 'Number of items per page' }
        ]
      },
      {
        method: 'POST',
        path: '/api/v1/products',
        description: 'Create a new product',
        authentication: 'Bearer Token',
        parameters: [
          { name: 'name', type: 'string', description: 'Product name' },
          { name: 'price', type: 'number', description: 'Product price' }
        ]
      }
    ],
    orders: [
      {
        method: 'GET',
        path: '/api/v1/orders',
        description: 'List all orders',
        authentication: 'Bearer Token',
        parameters: [
          { name: 'status', type: 'string', description: 'Filter by order status' },
          { name: 'dateFrom', type: 'string', description: 'Start date filter' }
        ]
      },
      {
        method: 'POST',
        path: '/api/v1/orders',
        description: 'Create a new order',
        authentication: 'Bearer Token',
        parameters: [
          { name: 'products', type: 'array', description: 'Array of product IDs' },
          { name: 'customer', type: 'object', description: 'Customer information' }
        ]
      }
    ],
    suppliers: [
      {
        method: 'GET',
        path: '/api/v1/suppliers',
        description: 'List all suppliers',
        authentication: 'Bearer Token',
        parameters: [
          { name: 'category', type: 'string', description: 'Filter by category' },
          { name: 'location', type: 'string', description: 'Filter by location' }
        ]
      },
      {
        method: 'POST',
        path: '/api/v1/suppliers/connect',
        description: 'Connect with a supplier',
        authentication: 'Bearer Token',
        parameters: [
          { name: 'supplierId', type: 'string', description: 'Supplier ID' },
          { name: 'integrationData', type: 'object', description: 'Integration details' }
        ]
      }
    ]
  };

  const gettingStartedSteps = [
    {
      icon: <Key className="h-6 w-6 text-primary" />,
      title: "Authentication",
      description: "Get your API keys from the dashboard"
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Authorization",
      description: "Use Bearer token authentication for all requests"
    },
    {
      icon: <Server className="h-6 w-6 text-primary" />,
      title: "Base URL",
      description: "https://api.dropconnect.com/v1"
    },
    {
      icon: <RefreshCcw className="h-6 w-6 text-primary" />,
      title: "Rate Limits",
      description: "1000 requests per minute per API key"
    }
  ];

  const categories = [
    {
      icon: <Package className="h-6 w-6" />,
      name: "Products",
      description: "Manage your product catalog"
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      name: "Orders",
      description: "Handle order processing and fulfillment"
    },
    {
      icon: <Truck className="h-6 w-6" />,
      name: "Suppliers",
      description: "Connect and manage suppliers"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="flex items-center gap-3 mb-8">
          <Code2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">API Documentation</h1>
        </div>

        <p className="text-xl text-muted-foreground mb-12">
          Integrate DropConnect's powerful features directly into your applications
        </p>

        {/* Getting Started */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {gettingStartedSteps.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">API Reference</h2>
          
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              {categories.map((category) => (
                <TabsTrigger key={category.name.toLowerCase()} value={category.name.toLowerCase()}>
                  <div className="flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(endpoints).map(([category, categoryEndpoints]) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-6">
                  {categoryEndpoints.map((endpoint, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-bold rounded ${
                                endpoint.method === 'GET' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {endpoint.method}
                              </span>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {endpoint.path}
                              </code>
                            </div>
                            <p className="text-muted-foreground">{endpoint.description}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Auth: {endpoint.authentication}
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param, i) => (
                              <div key={i} className="flex items-start gap-4 text-sm">
                                <code className="min-w-[100px] bg-muted px-2 py-1 rounded">
                                  {param.name}
                                </code>
                                <span className="text-primary min-w-[80px]">{param.type}</span>
                                <span className="text-muted-foreground">{param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* SDKs & Libraries */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">SDKs & Libraries</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Node.js", version: "v2.1.0", icon: "https://placehold.co/40x40/4f46e5/ffffff?text=N" },
              { name: "Python", version: "v1.8.0", icon: "https://placehold.co/40x40/4f46e5/ffffff?text=P" },
              { name: "PHP", version: "v3.0.1", icon: "https://placehold.co/40x40/4f46e5/ffffff?text=P" }
            ].map((sdk, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={sdk.icon} alt={sdk.name} className="w-10 h-10 rounded" />
                    <div>
                      <h3 className="font-semibold">{sdk.name}</h3>
                      <p className="text-sm text-muted-foreground">{sdk.version}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View Documentation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support */}
        <Card className="bg-primary/10">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Our developer support team is here to help you integrate with our API
            </p>
            <div className="flex justify-center gap-4">
              <Button>Contact Support</Button>
              <Button variant="outline">Join Developer Community</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocsPage;