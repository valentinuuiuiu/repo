import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  LayoutGrid,
  ShoppingCart,
  BarChart3,
  Settings,
  Package,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  path: string;
}

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DashboardSidebar = ({
  collapsed = false,
  onToggleCollapse = () => {},
}: DashboardSidebarProps) => {
  const location = useLocation();
  const items = [
    {
      icon: <LayoutGrid size={20} />,
      label: "Dashboard",
      href: "/dashboard",
      path: "/dashboard",
    },
    {
      icon: <Package size={20} />,
      label: "Products",
      href: "/products",
      path: "/products",
    },
    {
      icon: <ShoppingCart size={20} />,
      label: "Orders",
      href: "/orders",
      path: "/orders",
    },
    {
      icon: <BarChart3 size={20} />,
      label: "Analytics",
      href: "/analytics",
      path: "/analytics",
    },
    {
      icon: <Users size={20} />,
      label: "Suppliers",
      href: "/suppliers",
      path: "/suppliers",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/settings",
      path: "/settings",
    },
  ].map((item) => ({
    ...item,
    isActive: location.pathname === item.path,
  }));

  return (
    <div
      className={cn(
        "h-full bg-white border-r flex flex-col transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[280px]",
      )}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold">Dropship</h1>}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={onToggleCollapse}
          >
            <LayoutGrid size={20} />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map((item, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={item.isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "justify-center" : "",
                  )}
                  asChild
                >
                  <Link to={item.href} className="flex items-center">
                    {item.icon}
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      <div className="p-2 border-t">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  collapsed ? "justify-center" : "",
                )}
              >
                <HelpCircle size={20} />
                {!collapsed && <span className="ml-3">Help & Support</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Help & Support</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DashboardSidebar;
