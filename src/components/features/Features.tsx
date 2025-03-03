import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  ShoppingCart, 
  Bot, 
  LineChart, 
  Globe, 
  Truck, 
  Shield
} from 'lucide-react';

const features = [
  {
    title: 'Smart Product Discovery',
    description: 'AI-powered product research and recommendations based on market trends and performance data.',
    icon: ShoppingCart
  },
  {
    title: 'AI Agents',
    description: 'Intelligent agents that automate supplier communication, order processing, and customer support.',
    icon: Bot
  },
  {
    title: 'Analytics Dashboard',
    description: 'Comprehensive analytics and reporting tools to track performance and make data-driven decisions.',
    icon: LineChart
  },
  {
    title: 'Global Supplier Network',
    description: 'Access to a curated network of verified suppliers from around the world.',
    icon: Globe
  },
  {
    title: 'Automated Fulfillment',
    description: 'Streamlined order fulfillment with automated supplier coordination and tracking.',
    icon: Truck
  },
  {
    title: 'Quality Assurance',
    description: 'Built-in quality control measures and supplier performance monitoring.',
    icon: Shield
  }
];

const Features = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Platform Features</h1>
        <p className="text-xl text-muted-foreground">
          Discover the powerful features that make DropConnect the leading dropshipping solution
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;