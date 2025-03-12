import { ReactNode } from "react";

// Mock StripeProvider since we don't have the actual Stripe package installed
export function StripeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
