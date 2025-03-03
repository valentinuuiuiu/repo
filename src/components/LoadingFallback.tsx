import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const LoadingFallback: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing application...');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        
        // Simulate loading progress with different messages
        if (prevProgress < 25) {
          setLoadingMessage('Loading core modules...');
        } else if (prevProgress < 50) {
          setLoadingMessage('Connecting to services...');
        } else if (prevProgress < 75) {
          setLoadingMessage('Preparing resources...');
        } else {
          setLoadingMessage('Almost ready...');
        }
        
        return prevProgress + 10;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white" 
      aria-label="Loading"
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Loader2 
            className="h-16 w-16 animate-spin text-blue-500" 
            strokeWidth={2} 
          />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          DropConnect is loading
        </h2>
        
        <p className="text-gray-600 mb-4">
          {loadingMessage}
        </p>
        
        <div className="max-w-md mx-auto">
          <Progress 
            value={progress} 
            className="w-full h-2 bg-blue-100"
            indicatorClassName="bg-blue-500"
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          {progress}% Complete
        </div>
        
        <div className="mt-6 text-xs text-gray-400">
          <p>Powered by DropConnect Platform</p>
          <p>Version {import.meta.env.VITE_APP_VERSION || 'dev'}</p>
        </div>
      </div>
    </div>
  );
};