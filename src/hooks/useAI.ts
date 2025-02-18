import { useContext } from "react";
import { AIContext } from "../providers/AIProvider";

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
