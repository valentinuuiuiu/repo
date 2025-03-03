import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const TermsOfServicePage = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using DropConnect's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.`
    },
    {
      title: "2. Use License",
      content: `Permission is granted to temporarily access the materials (information or software) on DropConnect's website for personal, non-commercial transitory viewing only.`
    },
    {
      title: "3. Account Registration",
      content: `To access certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.`
    },
    {
      title: "4. Service Terms",
      content: `Our platform enables connections between merchants and suppliers. We are not responsible for the quality of products, delivery times, or business relationships formed through our platform.`
    },
    {
      title: "5. Payment Terms",
      content: `Users agree to pay all fees and charges associated with their accounts on time and to maintain valid payment information. All fees are exclusive of taxes unless stated otherwise.`
    },
    {
      title: "6. Intellectual Property",
      content: `The Service and its original content, features, and functionality are owned by DropConnect and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`
    },
    {
      title: "7. User Content",
      content: `Users retain ownership of content they upload to the platform. By uploading content, you grant DropConnect a worldwide, non-exclusive license to use, reproduce, and distribute that content.`
    },
    {
      title: "8. Termination",
      content: `We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.`
    },
    {
      title: "9. Limitation of Liability",
      content: `In no event shall DropConnect, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.`
    },
    {
      title: "10. Changes to Terms",
      content: `We reserve the right to modify or replace these Terms at any time. We will provide reasonable notice of any changes.`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg mb-8">
            Welcome to DropConnect. By using our services, you agree to be bound by the following terms and conditions.
            Please read them carefully before using our platform.
          </p>

          {sections.map((section, index) => (
            <Card key={index} className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <p className="text-muted-foreground">{section.content}</p>
              </CardContent>
            </Card>
          ))}

          <div className="mt-8 text-muted-foreground">
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@dropconnect.com" className="text-primary hover:underline">
                legal@dropconnect.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;