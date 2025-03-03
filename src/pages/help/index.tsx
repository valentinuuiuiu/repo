import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search,
  Book,
  HeadphonesIcon,
  PlayCircle,
  MessageCircle,
  FileText,
  ArrowRight
} from 'lucide-react';

const HelpCenterPage = () => {
  const categories = [
    {
      icon: <Book className="h-6 w-6" />,
      title: "Getting Started",
      description: "New to DropConnect? Start here",
      articles: [
        "Platform Overview",
        "Account Setup",
        "Connecting Your First Store"
      ]
    },
    {
      icon: <HeadphonesIcon className="h-6 w-6" />,
      title: "Support",
      description: "Get help when you need it",
      articles: [
        "Contact Support",
        "Live Chat",
        "Submit a Ticket"
      ]
    },
    {
      icon: <PlayCircle className="h-6 w-6" />,
      title: "Video Tutorials",
      description: "Learn through step-by-step videos",
      articles: [
        "Platform Walkthrough",
        "Supplier Integration",
        "Order Management"
      ]
    }
  ];

  const popularTopics = [
    "How to connect a new supplier",
    "Setting up automated fulfillment",
    "Managing inventory across platforms",
    "Processing returns",
    "Payment settings",
    "API documentation"
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section with Search */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find answers to your questions and learn how to make the most of DropConnect
        </p>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            type="search"
            placeholder="Search for help articles..."
            className="w-full pl-10 h-12"
          />
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {categories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {category.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <ul className="space-y-2 mb-4">
                {category.articles.map((article, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    {article}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Topics */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {popularTopics.map((topic, index) => (
            <Card key={index} className="hover:bg-accent transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <span>{topic}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center bg-primary/10 rounded-xl p-12">
        <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Our support team is available 24/7 to assist you with any questions or issues
        </p>
        <div className="flex justify-center gap-4">
          <Button>Contact Support</Button>
          <Button variant="outline">Live Chat</Button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;