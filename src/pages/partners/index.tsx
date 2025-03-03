import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2,
  Users,
  Trophy,
  BarChart,
  ArrowRight,
  HandshakeIcon,
  Globe,
  Briefcase
} from 'lucide-react';

const PartnersPage = () => {
  const partnerTypes = [
    {
      icon: <Building2 className="h-6 w-6 text-primary" />,
      title: "Technology Partners",
      description: "Join our ecosystem of technology providers and expand your reach",
      benefits: [
        "API integration support",
        "Co-marketing opportunities",
        "Joint solution development",
        "Partner portal access"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Solution Partners",
      description: "Deliver value-added services to our mutual customers",
      benefits: [
        "Implementation support",
        "Training resources",
        "Lead sharing",
        "Partner certification"
      ]
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Global Resellers",
      description: "Expand your portfolio with our dropshipping platform",
      benefits: [
        "Competitive margins",
        "Sales enablement",
        "Technical support",
        "Market development funds"
      ]
    }
  ];

  const featuredPartners = [
    {
      name: "TechCorp Solutions",
      logo: "https://placehold.co/200x100/4f46e5/ffffff?text=TechCorp",
      type: "Technology Partner",
      description: "Leading e-commerce technology provider"
    },
    {
      name: "Global Commerce Inc",
      logo: "https://placehold.co/200x100/4f46e5/ffffff?text=GCI",
      type: "Solution Partner",
      description: "International e-commerce consultancy"
    },
    {
      name: "Digital Retail Pro",
      logo: "https://placehold.co/200x100/4f46e5/ffffff?text=DRP",
      type: "Reseller Partner",
      description: "Digital retail solutions provider"
    }
  ];

  const benefits = [
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Revenue Growth",
      description: "Access new markets and revenue streams through our partnership program"
    },
    {
      icon: <HandshakeIcon className="h-6 w-6" />,
      title: "Collaboration",
      description: "Work closely with our team to deliver innovative solutions"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Business Impact",
      description: "Drive meaningful results for your business and customers"
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Resources",
      description: "Get access to training, marketing materials, and technical support"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Partner with DropConnect</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join our partner ecosystem and help shape the future of e-commerce
        </p>
        <Button size="lg">
          Become a Partner
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Partner Types */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {partnerTypes.map((type, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="mb-6">{type.icon}</div>
              <h2 className="text-2xl font-bold mb-4">{type.title}</h2>
              <p className="text-muted-foreground mb-6">{type.description}</p>
              <ul className="space-y-3 mb-6">
                {type.benefits.map((benefit, i) => (
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
                    {benefit}
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

      {/* Featured Partners */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Partners</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredPartners.map((partner, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 mb-4 object-contain"
                />
                <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
                <p className="text-sm text-primary mb-2">{partner.type}</p>
                <p className="text-muted-foreground">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Partner With Us</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-primary/10 rounded-xl p-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join our partner network and unlock new opportunities for growth
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Apply Now</Button>
          <Button size="lg" variant="outline">Contact Partner Team</Button>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;