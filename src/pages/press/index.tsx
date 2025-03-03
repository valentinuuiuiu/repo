import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowRight, NewspaperIcon, Users } from 'lucide-react';

const PressPage = () => {
  const pressReleases = [
    {
      title: "DropConnect Raises $50M Series B to Revolutionize Global E-commerce",
      date: "February 15, 2024",
      excerpt: "Funding will accelerate platform development and international expansion.",
      category: "Company News"
    },
    {
      title: "DropConnect Launches AI-Powered Supplier Verification System",
      date: "January 30, 2024",
      excerpt: "New technology helps merchants identify and connect with reliable suppliers.",
      category: "Product Updates"
    },
    {
      title: "DropConnect Expands Operations to Southeast Asia",
      date: "January 15, 2024",
      excerpt: "Strategic expansion opens new opportunities for global merchants.",
      category: "Expansion"
    }
  ];

  const mediaHighlights = [
    {
      source: "TechCrunch",
      title: "How DropConnect is Transforming the E-commerce Landscape",
      date: "February 2024",
      logo: "https://placehold.co/100x50/png"
    },
    {
      source: "Forbes",
      title: "The Future of Dropshipping: DropConnect's Revolutionary Approach",
      date: "January 2024",
      logo: "https://placehold.co/100x50/png"
    },
    {
      source: "Business Insider",
      title: "Meet the Platform That's Democratizing Global E-commerce",
      date: "December 2023",
      logo: "https://placehold.co/100x50/png"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Press & Media</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Get the latest news and updates about DropConnect's mission to revolutionize e-commerce
        </p>
        <div className="flex justify-center gap-4">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Press Kit
          </Button>
          <Button variant="outline">
            <NewspaperIcon className="mr-2 h-4 w-4" />
            Media Inquiries
          </Button>
        </div>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { number: "500K+", label: "Active Merchants" },
          { number: "50+", label: "Countries" },
          { number: "$2B+", label: "Annual GMV" }
        ].map((stat, index) => (
          <div key={index} className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
            <div className="text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Press Releases */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Recent Press Releases</h2>
        <div className="grid gap-6">
          {pressReleases.map((release, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge className="mb-2">{release.category}</Badge>
                    <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                    <p className="text-muted-foreground">{release.excerpt}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{release.date}</div>
                </div>
                <Button variant="outline" size="small">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Media Coverage */}
      <div>
        <h2 className="text-3xl font-bold mb-8">Media Coverage</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {mediaHighlights.map((highlight, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <img
                  src={highlight.logo}
                  alt={highlight.source}
                  className="h-8 mb-4 object-contain"
                />
                <h3 className="font-semibold mb-2">{highlight.title}</h3>
                <div className="text-sm text-muted-foreground">{highlight.date}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PressPage;