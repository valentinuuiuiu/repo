import { loadStripe } from "@stripe/stripe-js";
import { Stripe } from "stripe";

// Initialize Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
export const stripePromise = loadStripe(stripePublicKey);

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export const stripeService = {
  async createPaymentIntent(amount: number, currency: string = "usd") {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    return paymentIntent;
  },

  async createSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });
    return subscription;
  },

  async createCustomer(email: string, name: string) {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  },

  async listProducts() {
    const products = await stripe.products.list({
      expand: ["data.default_price"],
    });
    return products;
  },

  async createCheckoutSession(
    items: Array<{ price: string; quantity: number }>,
  ) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items,
      mode: "payment",
      success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cancel`,
    });
    return session;
  },
};
