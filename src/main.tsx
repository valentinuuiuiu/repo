import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "./providers/StripeProvider";
import i18n from './lib/i18n';
import { I18nextProvider } from 'react-i18next';

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StripeProvider>
          <App />
        </StripeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  </I18nextProvider>,
);
