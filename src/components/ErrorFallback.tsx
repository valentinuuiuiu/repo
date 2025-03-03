import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  // Log the error for debugging
  React.useEffect(() => {
    console.error('Unhandled Error:', error);
    
    // Optional: Send error to logging service
    // You could integrate services like Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // Example of potential error logging
      // Sentry.captureException(error);
    }
  }, [error]);

  // Determine error type and provide specific guidance
  const getErrorDetails = () => {
    const errorType = error.constructor.name;
    
    switch (errorType) {
      case 'NetworkError':
        return {
          title: 'Network Connection Issue',
          description: 'Unable to connect to the server. Please check your internet connection.'
        };
      case 'AuthenticationError':
        return {
          title: 'Authentication Failed',
          description: 'You are not authorized to access this resource. Please log in again.'
        };
      case 'ValidationError':
        return {
          title: 'Data Validation Error',
          description: 'Some of the data you provided is invalid. Please review and try again.'
        };
      default:
        return {
          title: 'Unexpected Error Occurred',
          description: 'An unexpected error has interrupted your application.'
        };
    }
  };

  const { title, description } = getErrorDetails();

  return (
    <div role="alert" className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        
        {/* Error Details for Debugging */}
        <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Technical Details
          </summary>
          <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
            {error.message}
            {error.stack && `\n\nStack Trace:\n${error.stack}`}
          </pre>
        </details>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={resetErrorBoundary}
            variant="destructive"
            className="w-full"
          >
            Attempt Recovery
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};