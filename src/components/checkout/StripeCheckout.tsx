import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "../ui/use-toast";

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
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement)!,
        });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // In a real application, you would call your backend API to create a payment intent
      // For demo purposes, we'll simulate a successful payment

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful payment
      const mockPaymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        amount: amount,
        status: "succeeded",
        created: Date.now(),
        payment_method: paymentMethod.id,
      };

      toast({
        title: "Payment Successful",
        description: `Your payment of $${(amount / 100).toFixed(2)} has been processed successfully.`,
      });

      onSuccess?.(mockPaymentIntent);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>Secure payment processing with Stripe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="font-medium mb-2">Order Summary</h3>
          <div className="flex justify-between items-center p-3 bg-muted rounded-md">
            <span>{productName}</span>
            <span className="font-bold">${(amount / 100).toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Card Information
              </label>
              <div className="p-4 border rounded-md">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Test Card: 4242 4242 4242 4242, Exp: Any future date, CVC: Any 3
                digits, ZIP: Any 5 digits
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!stripe || isProcessing}>
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
