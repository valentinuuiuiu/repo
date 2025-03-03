import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, Shield, Clock, AlertCircle } from 'lucide-react';

const CookiePolicyPage = () => {
  const cookieTypes = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: [
        "Session cookies",
        "Authentication cookies",
        "Security cookies"
      ]
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Functional Cookies",
      description: "These cookies enable the website to provide enhanced functionality and personalization.",
      examples: [
        "Language preferences",
        "User interface customization",
        "Live chat services"
      ]
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website.",
      examples: [
        "Page visit statistics",
        "Traffic sources",
        "User behavior tracking"
      ]
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-primary" />,
      title: "Marketing Cookies",
      description: "These cookies are used to track visitors across websites to display relevant advertisements.",
      examples: [
        "Advertising tracking",
        "Social media integration",
        "Retargeting cookies"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Cookie Policy</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg mb-8">
            This Cookie Policy explains how DropConnect uses cookies and similar tracking technologies 
            on our website. By using our platform, you consent to the use of cookies as described in this policy.
          </p>

          <h2 className="text-2xl font-bold mb-6">What are Cookies?</h2>
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your device when you visit a website. 
                They are widely used to make websites work more efficiently and provide useful information 
                to website owners. Cookies help us improve your browsing experience and deliver more 
                personalized services.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Types of Cookies We Use</h2>
          <div className="grid gap-6 mb-12">
            {cookieTypes.map((type, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                      <p className="text-muted-foreground mb-4">{type.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example, i) => (
                          <span 
                            key={i}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Managing Cookies</h2>
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">
                Most web browsers allow you to control cookies through their settings preferences. 
                However, limiting cookies may impact your experience using our website. To manage your 
                cookie preferences for our website, you can use the button below.
              </p>
              <Button>Manage Cookie Preferences</Button>
            </CardContent>
          </Card>

          <div className="space-y-6 text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground">Additional Information</h2>
            
            <h3 className="text-xl font-semibold text-foreground">Third-Party Cookies</h3>
            <p>
              Some of our pages display content from external providers, such as YouTube, Facebook, and 
              Twitter. To view this third-party content, you first have to accept their specific terms 
              and conditions. This includes their cookie policies, which we have no control over.
            </p>

            <h3 className="text-xl font-semibold text-foreground">Updates to This Policy</h3>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page 
              with an updated revision date.
            </p>

            <div className="mt-8">
              <p>
                For any questions about our Cookie Policy, please contact us at{' '}
                <a href="mailto:privacy@dropconnect.com" className="text-primary hover:underline">
                  privacy@dropconnect.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;