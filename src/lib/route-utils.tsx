import React, { Suspense, ReactNode } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

/**
 * Error fallback component for error boundary
 */
export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div role="alert" className="p-6 text-center bg-red-50">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <pre className="text-red-500 mb-4">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
};

/**
 * Loading fallback component for Suspense
 */
export const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-primary"></div>
  </div>
);

/**
 * Wrapper component for consistent error handling and loading
 */
export const SafeComponent: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

/**
 * Route group type for organizing routes by layout
 */
export interface RouteGroup {
  path: string;
  component: React.ComponentType;
  showSidebar?: boolean;
}

/**
 * Creates route elements with consistent error handling and suspense
 */
export const createRouteElement = (
  Layout: React.ComponentType<any>,
  Component: React.ComponentType,
  props: Record<string, any> = {}
) => (
  <SafeComponent>
    <Layout {...props}>
      <Component />
    </Layout>
  </SafeComponent>
);