import React from "react";
import { Bell, Search, Settings, User, LogOut } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAuth } from "@/lib/auth/supabase-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "../ui/use-toast";

interface DashboardHeaderProps {
  userAvatar?: string;
  userName?: string;
  notificationCount?: number;
  onSearch?: (value: string) => void;
}

const DashboardHeader = ({
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  userName,
  notificationCount = 3,
  onSearch = () => {},
}: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Use the user's email from auth if available
  const displayName =
    userName || (user?.email ? user.email.split("@")[0] : "Guest");

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="w-full h-[72px] px-6 border-b bg-white flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Dropship Dashboard</h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products, orders, or suppliers..."
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <TooltipProvider>
          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          {/* Upgrade */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" asChild>
                <a href="/checkout">Upgrade Plan</a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upgrade to Pro</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={displayName} />
                <AvatarFallback>
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/checkout")}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
