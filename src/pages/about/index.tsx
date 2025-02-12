import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About Dropship Platform</h1>
            <p className="text-xl text-gray-600 mb-8">
              Empowering e-commerce entrepreneurs with powerful tools to manage
              and scale their dropshipping business.
            </p>
            <Button size="lg">Get Started</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">
                  Product Discovery
                </h3>
                <p className="text-gray-600">
                  Find winning products from trusted suppliers with our advanced
                  product research tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Automated Sync</h3>
                <p className="text-gray-600">
                  Keep your inventory and orders synchronized across multiple
                  platforms automatically.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Analytics</h3>
                <p className="text-gray-600">
                  Make data-driven decisions with comprehensive analytics and
                  reporting tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "John Smith",
                role: "CEO & Founder",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
              },
              {
                name: "Sarah Johnson",
                role: "CTO",
                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
              },
              {
                name: "Michael Brown",
                role: "Head of Product",
                image:
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
              },
            ].map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full mb-4"
                  />
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
