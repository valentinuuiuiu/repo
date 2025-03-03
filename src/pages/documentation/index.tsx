import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen,
  Code2,
  FileText,
  Search,
  Video,
  MessageSquare,
  BookMarked,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

const DocumentationPage = () => {
  const categories = [
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "Getting Started",
      description: "Learn the basics of DropConnect and how to set up your account",
      links: [
        { title: "Quick Start Guide", href: "/docs/quick-start" },
        { title: "Platform Overview", href: "/docs/overview" },
        { title: "Account Setup", href: "/docs/account-setup" }
      ]
    },
    {
      icon: <Code2 className="h-6 w-6 text-primary" />,
      title: "API Documentation",
      description: "Integrate DropConnect into your applications",
      links: [
        { title: "API Reference", href: "/api" },
        { title: "Authentication", href: "/docs/api/auth" },
        { title: "Webhooks", href: "/docs/api/webhooks" }
      ]
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Platform Guides",
      description: "Detailed guides for using DropConnect's features",
      links: [
        { title: "Product Management", href: "/docs/products" },
        { title: "Supplier Integration", href: "/docs/suppliers" },
        { title: "Order Processing", href: "/docs/orders" }
      ]
    },
    {
      icon: <Video className="h-6 w-6 text-primary" />,
      title: "Video Tutorials",
      description: "Learn through step-by-step video demonstrations",
      links: [
        { title: "Platform Walkthrough", href: "/docs/videos/walkthrough" },
        { title: "Feature Tutorials", href: "/docs/videos/features" },
        { title: "Best Practices", href: "/docs/videos/best-practices" }
      ]
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "FAQs",
      description: "Find answers to commonly asked questions",
      links: [
        { title: "General FAQs", href: "/docs/faqs/general" },
        { title: "Technical FAQs", href: "/docs/faqs/technical" },
        { title: "Billing FAQs", href: "/docs/faqs/billing" }
      ]
    },
    {
      icon: <BookMarked className="h-6 w-6 text-primary" />,
      title: "Resources",
      description: "Additional resources and reference materials",
      links: [
        { title: "Case Studies", href: "/docs/case-studies" },
        { title: "White Papers", href: "/docs/white-papers" },
        { title: "Release Notes", href: "/docs/releases" }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know about using DropConnect's platform and services
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="search"
              placeholder="Search documentation..."
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-background"
            />
          </div>
        </div>

        {/* Documentation Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {category.icon}
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="bg-primary/5 border-none">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions.
            </p>
            <div className="flex justify-center gap-4">
              <Button>Contact Support</Button>
              <Button variant="outline">Join Community</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentationPage;