import { useState } from "react";
import { StripeCheckout } from "@/components/checkout/StripeCheckout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export default function CheckoutPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
    features: string[];
    limitations: string[];
  } | null>(null);

  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter Plan",
      price: 2999, // $29.99
      features: [
        "Up to 100 products",
        "Basic AI recommendations",
        "Standard support",
        "1 store connection",
        "Manual order processing",
      ],
      limitations: [
        "No advanced analytics",
        "No automated pricing rules",
        "Limited AI features",
      ],
    },
    {
      name: "Professional Plan",
      price: 7999, // $79.99
      features: [
        "Unlimited products",
        "Advanced AI analytics",
        "Priority support",
        "3 store connections",
        "Automated pricing rules",
        "Bulk product import",
        "Inventory forecasting",
      ],
      limitations: ["No white-label options", "Limited API access"],
    },
    {
      name: "Enterprise Plan",
      price: 19999, // $199.99
      features: [
        "Unlimited everything",
        "Custom AI workflows",
        "Dedicated account manager",
        "Unlimited store connections",
        "Advanced inventory forecasting",
        "White-label options",
        "Full API access",
        "Custom integrations",
        "24/7 premium support",
      ],
      limitations: [],
    },
  ];

  const handleSelectPlan = (plan: (typeof plans)[0]) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    // In a real app, you would update the user's subscription status in your database
    console.log("Payment successful:", paymentIntent);

    // Redirect to success page or dashboard
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>

      {!showCheckout ? (
        <div>
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h2 className="text-xl font-medium mb-4">
              Supercharge Your Dropshipping Business
            </h2>
            <p className="text-muted-foreground">
              Choose the plan that best fits your business needs. All plans
              include our core platform features, with additional capabilities
              as you scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`overflow-hidden ${index === 1 ? "border-primary shadow-lg" : ""}`}
              >
                {index === 1 && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">{plan.name}</CardTitle>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-bold">
                      ${(plan.price / 100).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Features</h3>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Limitations</h3>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li
                              key={i}
                              className="flex items-center text-muted-foreground"
                            >
                              <X className="h-4 w-4 mr-2 text-red-500" />
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full mt-6"
                    variant={index === 1 ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-lg font-medium mb-4">Enterprise Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <Badge variant="outline" className="mb-2">
                  Enterprise
                </Badge>
                <h4 className="font-medium">Custom Integrations</h4>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <Badge variant="outline" className="mb-2">
                  Enterprise
                </Badge>
                <h4 className="font-medium">Dedicated Support</h4>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <Badge variant="outline" className="mb-2">
                  Enterprise
                </Badge>
                <h4 className="font-medium">White Labeling</h4>
              </div>
              <div className="border rounded-lg p-4 flex flex-col items-center">
                <Badge variant="outline" className="mb-2">
                  Enterprise
                </Badge>
                <h4 className="font-medium">Custom AI Models</h4>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-muted p-6 rounded-lg max-w-3xl mx-auto">
            <h3 className="text-lg font-medium mb-2">
              Need a custom solution?
            </h3>
            <p className="mb-4">
              Contact our sales team for a tailored plan that meets your
              specific business requirements.
            </p>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {selectedPlan && (
            <StripeCheckout
              amount={selectedPlan.price}
              productName={selectedPlan.name}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}
    </div>
  );
}
