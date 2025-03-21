import React from "react";
import { Bell, Search, Settings, User } from "lucide-react";
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
import { Globe } from "lucide-react";
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';

interface DashboardHeaderProps {
  userAvatar?: string;
  userName?: string;
  notificationCount?: number;
  onSearch?: (value: string) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ro', name: 'Romanian' },
];

const DashboardHeader = ({
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default",
  userName = "John Doe",
  notificationCount = 3,
  onSearch = () => {},
}: DashboardHeaderProps) => {
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
              <Button variant="ghost" size="icon">
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

          {/* Language Switcher */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    console.log('English selected');
                    i18n.changeLanguage('en');
                  }}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { 
                    console.log('Romanian selected');
                    i18n.changeLanguage('ro'); 
                  }}>
                    Romanian
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Language</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost"  className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
