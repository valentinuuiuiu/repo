import { createContext, useContext, useState, ReactNode } from "react";

interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  const value = {
    count,
    increment,
    decrement
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
