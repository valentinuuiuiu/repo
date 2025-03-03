import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';

const BlogPage = () => {
  const blogPosts = [
    {
      title: "10 Tips for Scaling Your Dropshipping Business",
      excerpt: "Learn the proven strategies that successful dropshippers use to scale their operations effectively.",
      category: "Growth",
      date: "2024-02-25",
      readTime: "8 min read",
      image: "https://placehold.co/600x400/png"
    },
    {
      title: "The Future of E-commerce: AI and Automation",
      excerpt: "Discover how artificial intelligence is revolutionizing the e-commerce landscape.",
      category: "Technology",
      date: "2024-02-20",
      readTime: "6 min read",
      image: "https://placehold.co/600x400/png"
    },
    {
      title: "Building Strong Supplier Relationships",
      excerpt: "Tips and strategies for developing lasting partnerships with reliable suppliers.",
      category: "Suppliers",
      date: "2024-02-15",
      readTime: "5 min read",
      image: "https://placehold.co/600x400/png"
    }
  ];

  const categories = [
    "All Posts",
    "Growth",
    "Technology",
    "Suppliers",
    "Marketing",
    "Success Stories"
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Insights, strategies, and success stories from the world of dropshipping
          </p>
        </div>
        <Button>Subscribe to Newsletter</Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant={index === 0 ? "default" : "outline"}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Featured Post */}
      <Card className="mb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative h-[300px] md:h-auto bg-muted rounded-l-lg">
            <img
              src="https://placehold.co/800x600/png"
              alt="Featured post"
              className="absolute inset-0 w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <Badge className="w-fit mb-4">Featured</Badge>
            <h2 className="text-2xl font-bold mb-4">
              How to Build a Million-Dollar Dropshipping Business
            </h2>
            <p className="text-muted-foreground mb-6">
              An in-depth guide on building a successful dropshipping business from scratch, 
              featuring insights from top entrepreneurs in the space.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-1" />
                Feb 28, 2024
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                12 min read
              </div>
            </div>
            <Button className="w-fit">
              Read Article
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post, index) => (
          <Card key={index} className="flex flex-col">
            <div className="relative h-48 bg-muted rounded-t-lg">
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="flex-grow p-6">
              <Badge className="mb-3">{post.category}</Badge>
              <CardTitle className="mb-3">{post.title}</CardTitle>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;