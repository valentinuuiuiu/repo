import { createContext, useEffect, useState, ReactNode } from "react";
import { AIService } from "../lib/ai/AIService";
import { useSuppliers } from "../hooks/useSuppliers";
import { usePlatforms } from "../hooks/usePlatforms";

export const AIContext = createContext<AIService | null>(null);

type AIProviderProps = {
  children: ReactNode;
};

export function AIProvider({ children }: AIProviderProps) {
  const [aiService, setAIService] = useState<AIService | null>(null);
  const { supplierManager } = useSuppliers();
  const { platformManager } = usePlatforms();

  useEffect(() => {
    if (supplierManager && platformManager) {
      setAIService(new AIService(supplierManager, platformManager));
    }
  }, [supplierManager, platformManager]);

  return <AIContext.Provider value={aiService}>{children}</AIContext.Provider>;
}
