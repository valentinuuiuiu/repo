import { useState } from "react";
import { StripeCheckout } from "@/components/checkout/StripeCheckout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
    features: string[];
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
      ],
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
      ],
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
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 mr-2 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
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
