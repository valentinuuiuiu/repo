import { StripeCheckout } from "@/components/checkout/StripeCheckout";

export default function CheckoutStoryboard() {
  return (
    <div className="w-full h-full bg-background p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      <div className="max-w-md mx-auto">
        <StripeCheckout
          amount={7999}
          productName="Professional Plan"
          onSuccess={(paymentIntent) =>
            console.log("Payment successful:", paymentIntent)
          }
          onCancel={() => console.log("Payment cancelled")}
        />
      </div>
    </div>
  );
}
