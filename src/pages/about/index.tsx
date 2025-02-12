import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
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
    </div>
  );
}
