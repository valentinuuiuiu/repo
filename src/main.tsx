import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "./providers/StripeProvider";
import { AuthProvider } from "./lib/auth/supabase-auth";
import { StoreProvider } from "./lib/store";
import { MockDataProvider } from "./components/ai/MockDataProvider";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <MockDataProvider>
            <StripeProvider>
              <BrowserRouter basename={basename}>
                <App />
              </BrowserRouter>
            </StripeProvider>
          </MockDataProvider>
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
