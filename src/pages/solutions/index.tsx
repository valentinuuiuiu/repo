import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Store, 
  Users, 
  Building2, 
  ShoppingBag,
  BarChart,
  Globe,
  ArrowRight
} from 'lucide-react';

const SolutionsPage = () => {
  const solutions = [
    {
      icon: <Store className="h-8 w-8 text-primary" />,
      title: "For New Entrepreneurs",
      description: "Start your dropshipping business with minimal investment and risk",
      features: [
        "Easy-to-use platform",
        "Pre-vetted suppliers",
        "Guided setup process",
        "Basic analytics"
      ]
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "For Growing Businesses",
      description: "Scale your operations with advanced tools and automation",
      features: [
        "Automated order fulfillment",
        "Inventory synchronization",
        "Multi-channel selling",
        "Advanced analytics"
      ]
    },
    {
      icon: <Building2 className="h-8 w-8 text-primary" />,
      title: "For Enterprise",
      description: "Custom solutions for large-scale operations",
      features: [
        "Dedicated account manager",
        "Custom integrations",
        "Priority support",
        "API access"
      ]
    }
  ];

  const features = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Product Management",
      description: "Easily manage and sync products across multiple platforms"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Analytics & Reporting",
      description: "Get detailed insights into your business performance"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Reach",
      description: "Connect with suppliers and customers worldwide"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Solutions for Every Business</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Whether you're just starting out or running a large operation, we have the right solution for you
        </p>
      </div>

      {/* Solutions Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {solutions.map((solution, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="mb-6">{solution.icon}</div>
              <h2 className="text-2xl font-bold mb-4">{solution.title}</h2>
              <p className="text-muted-foreground mb-6">{solution.description}</p>
              <ul className="space-y-3 mb-6">
                {solution.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <svg
                      className="mr-2 h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full group-hover:bg-primary/90">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Key Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Powerful tools and features to help you succeed
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 text-center bg-primary/10 rounded-xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of successful businesses using DropConnect
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Start Free Trial</Button>
          <Button size="lg" variant="outline">Contact Sales</Button>
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;