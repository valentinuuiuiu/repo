import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail,
  Phone,
  MessageSquare,
  Send,
  MapPin
} from 'lucide-react';

const ContactPage = () => {
  const contactMethods = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Call Us",
      description: "Talk to our team Mon-Fri from 9am to 5pm.",
      action: "+1 (555) 123-4567"
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours.",
      action: "support@dropconnect.com"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Live Chat",
      description: "Get instant help from our support team.",
      action: "Start Chat"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                <p className="text-muted-foreground mb-4">{method.description}</p>
                <Button variant="link" className="p-0">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="What's this about?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea placeholder="Tell us what you need help with..." rows={6} />
                  </div>
                  <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Visit our office</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Main Office</h3>
                      <p className="text-muted-foreground">
                        123 Business Avenue
                        <br />
                        Suite 100
                        <br />
                        San Francisco, CA 94107
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <ul className="text-muted-foreground space-y-1">
                      <li>Monday - Friday: 9:00 AM - 5:00 PM PST</li>
                      <li>Saturday - Sunday: Closed</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 aspect-video bg-muted rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs CTA */}
        <div className="text-center bg-primary/10 rounded-xl p-12">
          <h2 className="text-2xl font-bold mb-4">Looking for quick answers?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Check out our help center for answers to frequently asked questions.
          </p>
          <Button variant="outline">Visit Help Center</Button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;