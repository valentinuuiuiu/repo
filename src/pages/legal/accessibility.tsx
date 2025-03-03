import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accessibility,
  Monitor,
  Keyboard,
  MousePointer,
  Speaker,
  FileText,
  MessageCircle
} from 'lucide-react';

const AccessibilityPage = () => {
  const commitments = [
    {
      icon: <Monitor className="h-6 w-6 text-primary" />,
      title: "Visual Accessibility",
      description: "Our platform is designed with adequate color contrast, resizable text, and clear visual hierarchy.",
      features: [
        "High contrast mode",
        "Adjustable font sizes",
        "Screen reader compatibility"
      ]
    },
    {
      icon: <Keyboard className="h-6 w-6 text-primary" />,
      title: "Keyboard Navigation",
      description: "All features can be accessed and operated using only a keyboard.",
      features: [
        "Focus indicators",
        "Skip navigation links",
        "Logical tab order"
      ]
    },
    {
      icon: <MousePointer className="h-6 w-6 text-primary" />,
      title: "Input Methods",
      description: "Support for different input methods to accommodate various user needs.",
      features: [
        "Mouse alternatives",
        "Touch support",
        "Voice commands"
      ]
    },
    {
      icon: <Speaker className="h-6 w-6 text-primary" />,
      title: "Media Accessibility",
      description: "Ensuring multimedia content is accessible to all users.",
      features: [
        "Video captions",
        "Audio descriptions",
        "Transcripts"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Accessibility className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Accessibility Statement</h1>
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
            DropConnect is committed to ensuring digital accessibility for people with disabilities. 
            We are continually improving the user experience for everyone and applying the relevant 
            accessibility standards.
          </p>

          <h2 className="text-2xl font-bold mb-6">Our Approach to Accessibility</h2>
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                We strive to meet WCAG 2.1 Level AA standards across our platform. Our development 
                process includes regular accessibility testing and reviews to ensure we maintain and 
                improve accessibility features.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Accessibility Features</h2>
          <div className="grid gap-6 mb-12">
            {commitments.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature, i) => (
                          <span 
                            key={i}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6">Assistance & Feedback</h2>
          <Card className="mb-12">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="text-muted-foreground">
                  If you need assistance with any part of our website, please contact our support team. 
                  We're here to help ensure you can access all of our content and features.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <MessageCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="text-muted-foreground">
                  We welcome your feedback on the accessibility of our platform. Please let us know if you 
                  encounter any accessibility barriers or have suggestions for improvement.
                </p>
              </div>
              <div className="flex gap-4 mt-6">
                <Button>Contact Support</Button>
                <Button variant="outline">Submit Feedback</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground">Additional Resources</h2>
            
            <h3 className="text-xl font-semibold text-foreground">Browser Compatibility</h3>
            <p>
              Our platform is designed to work with modern web browsers and assistive technologies. 
              We recommend using the latest versions of browsers for the best experience.
            </p>

            <h3 className="text-xl font-semibold text-foreground">Ongoing Improvements</h3>
            <p>
              We are committed to maintaining and improving the accessibility of our platform. We regularly 
              review and update our accessibility features based on user feedback and emerging standards.
            </p>

            <div className="mt-8">
              <p>
                For accessibility-related questions or concerns, please contact us at{' '}
                <a href="mailto:accessibility@dropconnect.com" className="text-primary hover:underline">
                  accessibility@dropconnect.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;