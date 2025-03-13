import { ReactNode } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

export function StripeProvider({ children }: { children: ReactNode }) {
  // We're using a simplified version without Elements since we're using mock payment
  return <>{children}</>;
}
