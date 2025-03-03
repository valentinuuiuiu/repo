import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About DropConnect</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              DropConnect aims to revolutionize dropshipping by connecting merchants with reliable suppliers through an AI-powered platform that streamlines product discovery, integration, and order management.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We envision a future where e-commerce entrepreneurs can easily build and scale their businesses with access to a global network of verified suppliers and automated tools.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">What Sets Us Apart</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our advanced AI technology helps optimize product selection, pricing strategies, and inventory management.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access to thousands of verified suppliers worldwide, ensuring quality products and reliable shipping.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seamless Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Easy integration with major e-commerce platforms and marketplaces for efficient management.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;