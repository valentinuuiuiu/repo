import React from "react"
import { Heart } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MissionBannerProps {
  variant?: "default" | "compact"
  className?: string
}

export function MissionBanner({ variant = "default", className }: MissionBannerProps) {
  return (
    <Alert 
      variant="default" 
      className={`mission-banner border-primary/20 bg-background/50 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-center w-full">
        <AlertTitle className="flex items-center font-medium text-foreground dark:text-white m-0">
          <span className="dark:text-white">Powered by The AI of New_Zyon</span>
          <Heart className="mx-2 h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="dark:text-white">with love</span>
        </AlertTitle>
      </div>
    </Alert>
  )
}