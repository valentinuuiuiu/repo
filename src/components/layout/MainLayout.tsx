import { ReactNode, useState } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import Footer from "./Footer";
import { MissionBanner } from "../ui/mission-banner";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header with Profile section on the right */}
      <DashboardHeader 
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
        userName="John Doe"
        notificationCount={5}
      />
      
      <div className="mt-2 mb-2">
        <MissionBanner className="mx-auto w-full max-w-7xl px-4" />
      </div>
      
      <div className="flex-1 flex">
        {/* Left side Dashboard */}
        <DashboardSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}