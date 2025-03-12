import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Loader2, CreditCard, Check } from "lucide-react";
import { toast } from "../ui/use-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "@/lib/auth/supabase-auth";

interface StripeCheckoutProps {
  amount: number;
  productName: string;
  onSuccess?: (paymentIntent: any) => void;
  onCancel?: () => void;
}

export function StripeCheckout({
  amount,
  productName,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/25");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("");
  const [zip, setZip] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // In a real implementation, this would be a call to your backend
    // to create a payment intent and return the client secret
    const createPaymentIntent = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock client secret
        const mockSecret = `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`;
        setClientSecret(mockSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        setError("Failed to initialize payment. Please try again.");
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful payment
      const mockPaymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        amount,
        status: "succeeded",
        created: Date.now(),
      };

      setIsComplete(true);
      toast({
        title: "Payment successful",
        description: `Your payment of $${(amount / 100).toFixed(2)} has been processed successfully.`,
      });

      if (onSuccess) {
        onSuccess(mockPaymentIntent);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "An error occurred during payment processing");
      toast({
        title: "Payment failed",
        description:
          error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Complete</CardTitle>
          <CardDescription>
            Your subscription has been successfully activated.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-1">{productName}</h3>
          <p className="text-2xl font-bold mb-4">
            ${(amount / 100).toFixed(2)}/month
          </p>
          <p className="text-center text-muted-foreground">
            Thank you for your purchase! You now have access to all features
            included in the {productName}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          Enter your payment details to subscribe to {productName} for $
          {(amount / 100).toFixed(2)}/month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                required
              />
              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              For testing, use 4242 4242 4242 4242 with any future date and CVC.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">Postal Code</Label>
            <Input
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="12345"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isProcessing || !clientSecret}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
