import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './providers/theme-provider';
import Chatbot from './components/chatbot/Chatbot';

const router = createBrowserRouter([
  {
    path: "/*",
    element: <AppRoutes />
  }
]);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dropconnect-theme">
      <RouterProvider router={router} />
      <Toaster />
      <Chatbot />
    </ThemeProvider>
  );
}

export default App;