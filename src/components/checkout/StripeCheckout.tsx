import { useState } from "react";
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
import { Input } from "../ui/input";

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
  const [error, setError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/25");
  const [cvc, setCvc] = useState("123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful payment
      const mockPaymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        amount: amount,
        status: "succeeded",
        created: Date.now(),
        payment_method: "mock_payment_method",
      };

      toast({
        title: "Payment Successful",
        description: `Your payment of ${(amount / 100).toFixed(2)} has been processed successfully.`,
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
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Card Number
                  </label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Expiry Date
                    </label>
                    <Input
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">CVC</label>
                    <Input
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
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
        <Button onClick={handleSubmit} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
