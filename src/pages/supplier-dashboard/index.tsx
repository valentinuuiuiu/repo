import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Globe,
  PlusCircle,
  Settings,
  FileText
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

const SupplierDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const quickStats = [
    {
      title: "Total Revenue",
      value: "$128,450",
      change: "+15.3%",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: "Active Products",
      value: "2,345",
      change: "+22.7%",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "Orders Fulfilled",
      value: "1,876",
      change: "+19.5%",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "Connected Merchants",
      value: "187",
      change: "+8.2%",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const productCategories = [
    { name: "Electronics", products: 450, revenue: "$45,600", icon: "🔌" },
    { name: "Home & Garden", products: 320, revenue: "$32,000", icon: "🏡" },
    { name: "Fashion", products: 280, revenue: "$28,000", icon: "👗" },
    { name: "Beauty", products: 200, revenue: "$20,000", icon: "💄" },
    { name: "Sports", products: 180, revenue: "$18,000", icon: "⚽" }
  ];

  const filteredCategories = selectedCategory === 'all' 
    ? productCategories 
    : productCategories.filter(cat => cat.name === selectedCategory);

  const recentOrders = [
    {
      id: "SO-12345",
      merchant: "TechGadgets Store",
      product: "Wireless Earbuds",
      quantity: 50,
      total: "$2,499.50",
      status: "Shipped"
    },
    {
      id: "SO-12346",
      merchant: "Home Decor Pro",
      product: "Smart Home Devices",
      quantity: 30,
      total: "$4,200.00",
      status: "Processing"
    },
    {
      id: "SO-12347",
      merchant: "Fashion Trends",
      product: "Summer Collection",
      quantity: 100,
      total: "$7,500.00",
      status: "Pending"
    },
    {
      id: "SO-12348",
      merchant: "Fitness World",
      product: "Workout Accessories",
      quantity: 75,
      total: "$3,750.00",
      status: "Delivered"
    }
  ];

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline">Add New Product</Button>
            <Button>Invite Merchants</Button>
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

        {/* Product Categories & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Categories */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Product Categories</CardTitle>
                <Tabs 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <TabsList>
                    <TabsTrigger value="all">All Categories</TabsTrigger>
                    {productCategories.map(category => (
                      <TabsTrigger key={category.name} value={category.name}>
                        {category.name}
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
                    <TableHead>Category</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{category.icon}</span>
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.products}</TableCell>
                      <TableCell>{category.revenue}</TableCell>
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
              <CardTitle>Recent Sales Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.merchant}</TableCell>
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
                  <h3 className="text-lg font-medium mb-2">Add Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload new product listings
                  </p>
                </div>
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">Add Product</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Merchant Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage merchant connections
                  </p>
                </div>
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">View Merchants</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Sales and performance insights
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">View Reports</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your supplier profile
                  </p>
                </div>
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <Button className="w-full mt-4">Edit Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SupplierDashboard;