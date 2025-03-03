import React, { useState } from 'react';
import { 
  BarChart, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  Globe 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/layout/PageLayout";

const MerchantDashboard: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const quickStats = [
    {
      title: "Total Sales",
      value: "$42,890",
      change: "+10.1%",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Total Orders",
      value: "845",
      change: "+18.2%",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Active Products",
      value: "1,284",
      change: "+12.5%",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Connected Platforms",
      value: "5",
      change: "+2",
      icon: <Globe className="h-5 w-5" />,
    },
  ];

  const recentOrders = [
    {
      id: "DP-12345",
      platform: "Shopify",
      customer: "John Smith",
      product: "Wireless Headphones",
      total: "$129.99",
      status: "Shipped"
    },
    {
      id: "DP-12346",
      platform: "eBay",
      customer: "Emily Johnson",
      product: "Smart Watch",
      total: "$199.50",
      status: "Processing"
    },
    {
      id: "DP-12347",
      platform: "Amazon",
      customer: "Michael Brown",
      product: "Portable Speaker",
      total: "$79.99",
      status: "Delivered"
    },
    {
      id: "DP-12348",
      platform: "WooCommerce",
      customer: "Sarah Davis",
      product: "Fitness Tracker",
      total: "$89.99",
      status: "Pending"
    }
  ];

  const platformStats = [
    {
      name: "Shopify",
      sales: "$15,420",
      orders: 312,
      products: 450,
      logo: "/shopify-logo.svg"
    },
    {
      name: "eBay",
      sales: "$8,750",
      orders: 185,
      products: 250,
      logo: "/ebay-logo.svg"
    },
    {
      name: "Amazon",
      sales: "$12,300",
      orders: 245,
      products: 350,
      logo: "/amazon-logo.svg"
    },
    {
      name: "WooCommerce",
      sales: "$4,890",
      orders: 98,
      products: 150,
      logo: "/woocommerce-logo.svg"
    },
    {
      name: "Etsy",
      sales: "$1,530",
      orders: 45,
      products: 75,
      logo: "/etsy-logo.svg"
    }
  ];

  const filteredPlatformStats = selectedPlatform === 'all' 
    ? platformStats 
    : platformStats.filter(platform => platform.name === selectedPlatform);

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline">Add New Product</Button>
            <Button>Connect New Platform</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Platform Performance</CardTitle>
                <Tabs 
                  value={selectedPlatform} 
                  onValueChange={setSelectedPlatform}
                >
                  <TabsList>
                    <TabsTrigger value="all">All Platforms</TabsTrigger>
                    {platformStats.map(platform => (
                      <TabsTrigger key={platform.name} value={platform.name}>
                        {platform.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Active Products</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlatformStats.map((platform) => (
                    <TableRow key={platform.name}>
                      <TableCell className="font-medium">{platform.name}</TableCell>
                      <TableCell>{platform.sales}</TableCell>
                      <TableCell>{platform.orders}</TableCell>
                      <TableCell>{platform.products}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.platform}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            order.status === "Delivered" ? "default" :
                            order.status === "Processing" ? "secondary" :
                            order.status === "Pending" ? "outline" : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-center">
                <Button variant="outline" className="w-full">View All Orders</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Import Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Add new products from suppliers
                  </p>
                </div>
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">Import Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Sync Inventory</h3>
                  <p className="text-sm text-muted-foreground">
                    Update stock across all platforms
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">Sync Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Supplier Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your supplier connections
                  </p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">View Suppliers</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Deep insights into your business
                  </p>
                </div>
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">View Reports</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default MerchantDashboard;