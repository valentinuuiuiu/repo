import { ReactNode } from "react";
import DashboardHeader from "../dashboard/DashboardHeader";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <DashboardHeader />
      <div className="flex-1 flex">
        {showSidebar && <DashboardSidebar />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
