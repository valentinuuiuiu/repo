import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock } from 'lucide-react';

const CareersPage = () => {
  const jobOpenings = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "We're looking for an experienced frontend developer to help build our next-generation e-commerce platform."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Hybrid",
      type: "Full-time",
      description: "Lead the development of innovative dropshipping solutions and shape the future of e-commerce."
    },
    {
      title: "Customer Success Specialist",
      department: "Support",
      location: "Remote",
      type: "Full-time",
      description: "Help our merchants succeed by providing exceptional support and guidance."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Help us revolutionize the future of e-commerce and empower entrepreneurs worldwide
        </p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: "Innovation First",
            description: "We're constantly pushing boundaries and exploring new possibilities"
          },
          {
            title: "Customer Obsessed",
            description: "Everything we do starts with our customers' needs"
          },
          {
            title: "Global Impact",
            description: "We're building solutions that empower businesses worldwide"
          }
        ].map((value, index) => (
          <div key={index} className="text-center p-6 bg-primary/5 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
            <p className="text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      {/* Job Listings */}
      <div>
        <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
        <div className="grid gap-6">
          {jobOpenings.map((job, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {job.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.type}
                      </div>
                    </div>
                  </div>
                  <Badge>{job.department}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                <Button>Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareersPage;