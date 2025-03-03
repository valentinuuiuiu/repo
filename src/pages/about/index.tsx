import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import PageLayout from "@/components/layout/PageLayout";
import { Globe, Users, TrendingUp, Award, Clock, Shield } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Former e-commerce director with 15+ years experience in dropshipping and supply chain management.",
      image: "/placeholder-avatar.jpg"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Tech leader with background in building scalable platforms connecting global marketplaces.",
      image: "/placeholder-avatar.jpg"
    },
    {
      name: "Michael Rodriguez",
      role: "Head of Supplier Relations",
      bio: "10+ years experience working with manufacturers and suppliers across Asia and Europe.",
      image: "/placeholder-avatar.jpg"
    },
    {
      name: "Jessica Kim",
      role: "Head of Platform Integrations",
      bio: "Expert in e-commerce platform APIs and multi-channel selling strategies.",
      image: "/placeholder-avatar.jpg"
    }
  ];

  const companyValues = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Global Accessibility",
      description: "Making global commerce accessible to businesses of all sizes."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Entrepreneur Empowerment",
      description: "Providing tools that enable anyone to build a successful online business."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Continuous Innovation",
      description: "Constantly improving our platform to stay ahead of market trends."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Quality Assurance",
      description: "Ensuring reliable suppliers and high-quality products for our users."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Efficiency Focus",
      description: "Building automation that saves time and reduces operational complexity."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Trust & Security",
      description: "Creating a secure environment for all transactions and business operations."
    }
  ];

  const milestones = [
    {
      year: "2018",
      title: "Company Founded",
      description: "DropConnect was founded with a mission to simplify dropshipping for small business owners."
    },
    {
      year: "2019",
      title: "First Platform Integrations",
      description: "Launched integrations with Shopify and WooCommerce, connecting to major suppliers."
    },
    {
      year: "2020",
      title: "Expanded to 10,000 Users",
      description: "Reached milestone of 10,000 active users across 30 countries."
    },
    {
      year: "2021",
      title: "Series A Funding",
      description: "Secured $8.5M in Series A funding to accelerate platform development."
    },
    {
      year: "2022",
      title: "Multi-Channel Expansion",
      description: "Added support for eBay, Amazon, and Etsy integrations."
    },
    {
      year: "2023",
      title: "Global Supplier Network",
      description: "Expanded supplier network to include over 500 verified suppliers worldwide."
    }
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">{t('About DropConnect')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('Empowering e-commerce entrepreneurs with powerful tools to connect suppliers and sales platforms, manage and scale their dropshipping business.')}
          </p>
        </div>

        {/* Our Mission */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg mb-6 text-muted-foreground">
                At DropConnect, we're on a mission to democratize e-commerce by making it easier than ever for entrepreneurs to connect with global suppliers and sell across multiple platforms.
              </p>
              <p className="text-lg mb-6 text-muted-foreground">
                We believe that anyone with a vision should be able to build a successful online business without the traditional barriers of inventory investment, technical complexity, or operational overhead.
              </p>
              <p className="text-lg text-muted-foreground">
                By connecting the dots between suppliers and sales channels, we're creating opportunities for entrepreneurs worldwide to focus on what matters most: building their brand and growing their business.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-8">
              <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Company Vision Video</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="pt-6">
                  <div className="mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the people behind DropConnect
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The key milestones in our company history
            </p>
          </div>
          
          <div className="relative border-l border-border ml-4 md:ml-0 md:mx-auto md:max-w-3xl pl-8 space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-12 w-8 h-8 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <div>
                  <span className="text-sm font-bold text-primary">{milestone.year}</span>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/10 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Become part of the DropConnect ecosystem and transform your e-commerce business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">{t('Get Started')}</Button>
            <Button size="lg" variant="outline">Contact Our Team</Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
