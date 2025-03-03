import React, { Suspense } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StripeProvider } from "./StripeProvider";
import { AIProvider } from "./AIProvider";
import i18n from '../lib/i18n';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { ErrorFallback } from "../components/ErrorFallback";
import { LoadingFallback } from "../components/LoadingFallback";
import { z } from 'zod';

// Create a client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry logic with exponential backoff
      retry: (failureCount, error) => {
        // Custom retry logic
        if (error instanceof z.ZodError) return false; // Don't retry validation errors
        return failureCount < 3; // Retry up to 3 times
      },
      retryDelay: (attemptIndex) => Math.min(
        1000 * 2 ** attemptIndex, // Exponential backoff
        30000 // Max delay of 30 seconds
      ),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

// Global error handler
const globalErrorHandler = (error: Error, info: { componentStack: string }) => {
  // Log error to monitoring service
  console.error('Caught an error:', error, info);

  // You can add more sophisticated error logging here
  // For example, sending error to a logging service
  if (import.meta.env.PROD) {
    // In production, you might want to log to a service like Sentry
    // Sentry.captureException(error);
  }
};

/**
 * AppProviders component that wraps the application with all necessary providers
 * This makes the main.tsx file cleaner and more maintainable
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={globalErrorHandler}
        onReset={() => {
          // Reset the entire application state
          queryClient.clear();
          window.location.reload();
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <StripeProvider>
                <AIProvider>
                  {children}
                </AIProvider>
              </StripeProvider>
            </ThemeProvider>
            <ReactQueryDevtools 
              initialIsOpen={false} 
              position="bottom-right"
            />
          </QueryClientProvider>
        </Suspense>
      </ErrorBoundary>
    </I18nextProvider>
  );
};