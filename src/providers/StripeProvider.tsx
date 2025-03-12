import { ReactNode } from "react";

// Mock StripeProvider until @stripe/react-stripe-js is installed
export function StripeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
