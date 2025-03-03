import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Globe, Bell } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Information We Collect",
      content: `We collect information that you provide directly to us, including name, email address, company information, and payment details. We also automatically collect certain information about your device and usage of our services.`
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "How We Use Your Information",
      content: `We use the information we collect to provide, maintain, and improve our services, process your transactions, communicate with you, and comply with legal obligations.`
    },
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "Information Sharing",
      content: `We may share your information with suppliers and merchants as necessary to provide our services. We do not sell your personal information to third parties.`
    },
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Data Storage and Security",
      content: `We use industry-standard security measures to protect your information. Your data is stored on secure servers and encrypted during transmission.`
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "International Data Transfers",
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.`
    },
    {
      icon: <Bell className="h-6 w-6 text-primary" />,
      title: "Your Rights and Choices",
      content: `You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications and modify your privacy settings.`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg mb-8">
            At DropConnect, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our platform.
          </p>

          <div className="grid gap-6 mb-12">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                      <p className="text-muted-foreground">{section.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6 text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground">Additional Information</h2>
            
            <h3 className="text-xl font-semibold text-foreground">Cookies and Tracking Technologies</h3>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and 
              hold certain information. You can instruct your browser to refuse all cookies or to 
              indicate when a cookie is being sent.
            </p>

            <h3 className="text-xl font-semibold text-foreground">Children's Privacy</h3>
            <p>
              Our platform is not intended for individuals under the age of 18. We do not knowingly 
              collect personal information from children under 18.
            </p>

            <h3 className="text-xl font-semibold text-foreground">Changes to This Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <div className="mt-8">
              <p>
                If you have questions about this Privacy Policy, please contact our Data Protection Officer at{' '}
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

export default PrivacyPolicyPage;