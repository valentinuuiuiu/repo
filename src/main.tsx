import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "./providers/StripeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/auth/supabase-auth";
import { StoreProvider } from "./lib/store";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <StripeProvider>
            <BrowserRouter basename={basename}>
              <App />
              <Toaster />
            </BrowserRouter>
          </StripeProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
