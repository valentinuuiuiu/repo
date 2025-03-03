import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { z } from 'zod';
import Stripe from 'stripe';

// Custom error class
class StripeProviderError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message);
    this.name = 'StripeProviderError';
  }
}

// Stripe configuration schema
const StripeConfigSchema = z.object({
  apiKey: z.string().startsWith('sk_', 'Invalid Stripe secret key'),
  mode: z.enum(['test', 'live']).default('test'),
  webhookSecret: z.string().optional()
});

// Stripe context type
interface StripeContextType {
  stripe: Stripe;
  mode: 'test' | 'live';
  createPaymentIntent: (amount: number, currency: string) => Promise<string>;
  retrievePaymentIntent: (clientSecret: string) => Promise<Stripe.PaymentIntent>;
}

// Create Stripe context
const StripeContext = createContext<StripeContextType | null>(null);

// Custom hook to use Stripe context
export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new StripeProviderError('useStripe must be used within a StripeProvider');
  }
  return context;
};

// Stripe Provider component
export const StripeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Validate Stripe configuration
  const stripeApiKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
  const stripeMode = import.meta.env.VITE_STRIPE_MODE || 'test';
  const stripeWebhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

  try {
    // Validate configuration using Zod
    const config = StripeConfigSchema.parse({
      apiKey: stripeApiKey,
      mode: stripeMode,
      webhookSecret: stripeWebhookSecret
    });

    // Initialize Stripe client
    const stripe = new Stripe(config.apiKey, {
      apiVersion: '2023-10-16'
    });

    // Create payment intent with error handling
    const createPaymentIntent = useCallback(async (amount: number, currency: string): Promise<string> => {
      try {
        // Validate input
        if (amount <= 0) {
          throw new StripeProviderError('Invalid payment amount', { amount });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          payment_method_types: ['card']
        });

        if (!paymentIntent.client_secret) {
          throw new StripeProviderError('Failed to generate client secret');
        }

        return paymentIntent.client_secret;
      } catch (error) {
        console.error('Payment intent creation failed:', error);
        throw new StripeProviderError('Failed to create payment intent', { 
          originalError: error,
          amount,
          currency 
        });
      }
    }, [stripe]);

    // Retrieve payment intent with error handling
    const retrievePaymentIntent = useCallback(async (clientSecret: string): Promise<Stripe.PaymentIntent> => {
      try {
        if (!clientSecret) {
          throw new StripeProviderError('Invalid client secret');
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          clientSecret.split('_secret_')[0]
        );

        return paymentIntent;
      } catch (error) {
        console.error('Payment intent retrieval failed:', error);
        throw new StripeProviderError('Failed to retrieve payment intent', { 
          originalError: error,
          clientSecret 
        });
      }
    }, [stripe]);

    // Provide context value
    const contextValue: StripeContextType = {
      stripe,
      mode: config.mode,
      createPaymentIntent,
      retrievePaymentIntent
    };

    return (
      <StripeContext.Provider value={contextValue}>
        {children}
      </StripeContext.Provider>
    );
  } catch (configError) {
    console.error('Stripe configuration error:', configError);
    
    // Fallback provider that throws errors
    return (
      <StripeContext.Provider value={null as any}>
        {children}
        <div role="alert" className="text-red-500 p-4">
          Stripe Provider Configuration Error: {configError instanceof Error ? configError.message : 'Unknown error'}
        </div>
      </StripeContext.Provider>
    );
  }
};