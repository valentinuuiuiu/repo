import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Map,
  Store,
  BarChart,
  Users,
  FileText,
  HelpCircle,
  Lock,
  Building
} from 'lucide-react';

const SitemapPage = () => {
  const sections = [
    {
      icon: <Store className="h-6 w-6 text-primary" />,
      title: "Platform",
      links: [
        { name: "Features", href: "/features" },
        { name: "Suppliers", href: "/suppliers" },
        { name: "Platforms", href: "/platforms" },
        { name: "Solutions", href: "/solutions" },
        { name: "Pricing", href: "/pricing" }
      ]
    },
    {
      icon: <Building className="h-6 w-6 text-primary" />,
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Press", href: "/press" },
        { name: "Partners", href: "/partners" }
      ]
    },
    {
      icon: <BarChart className="h-6 w-6 text-primary" />,
      title: "Dashboard",
      links: [
        { name: "Overview", href: "/dashboard" },
        { name: "Products", href: "/dashboard/products" },
        { name: "Orders", href: "/dashboard/orders" },
        { name: "Analytics", href: "/dashboard/analytics" },
        { name: "Settings", href: "/dashboard/settings" }
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Account",
      links: [
        { name: "Login", href: "/auth/login" },
        { name: "Register", href: "/auth/register" },
        { name: "Profile", href: "/profile" },
        { name: "Preferences", href: "/preferences" }
      ]
    },
    {
      icon: <HelpCircle className="h-6 w-6 text-primary" />,
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Documentation", href: "/documentation" },
        { name: "API Reference", href: "/api" },
        { name: "Contact Us", href: "/contact" }
      ]
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Legal",
      links: [
        { name: "Terms of Service", href: "/legal/terms-of-service" },
        { name: "Privacy Policy", href: "/legal/privacy-policy" },
        { name: "Cookie Policy", href: "/legal/cookie-policy" },
        { name: "Accessibility", href: "/legal/accessibility" }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Map className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Sitemap</h1>
        </div>

        <p className="text-lg text-muted-foreground mb-12">
          Find your way around our platform with this comprehensive sitemap of all our pages and resources.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link 
                        to={link.href}
                        className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;