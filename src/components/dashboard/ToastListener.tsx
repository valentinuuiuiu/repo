import { useEffect } from "react";
import { toast } from "../ui/use-toast";

interface ToastEvent extends CustomEvent {
  detail: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  };
}

export function ToastListener() {
  useEffect(() => {
    const handleToast = (event: Event) => {
      const { title, description, variant } = (event as ToastEvent).detail;
      toast({
        title,
        description,
        variant: variant || "default",
      });
    };

    document.addEventListener("toast", handleToast);

    return () => {
      document.removeEventListener("toast", handleToast);
    };
  }, []);

  return null;
}
