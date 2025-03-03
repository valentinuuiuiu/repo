import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ThemeProvider from './theme/ThemeProvider';
import ErrorBoundary from "./ErrorBoundary";

// Lazy load the App component for better performance
const App = lazy(() => import("./App"));

/**
 * Main entry point for the application
 * This file sets up the React root and renders the application with
 * necessary providers and error handling
 */

// Get the root element from the DOM
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id 'root' in your HTML.");
}

// Create root using React 18's createRoot API
const root = ReactDOM.createRoot(rootElement);

// Render the app with theme provider, error boundary, and suspense fallback
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
