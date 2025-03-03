import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ModernFooter from "./ModernFooter";
import { MissionBanner } from "../ui/mission-banner";

interface ModernEcommerceLayoutProps {
  children?: React.ReactNode;
  departments?: any[];
}

export default function ModernEcommerceLayout({ departments }: ModernEcommerceLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar departments={departments} />
      {/* Banner positioned after navbar with appropriate spacing */}
      <div className="pt-20">
        <MissionBanner className="mx-auto max-w-7xl px-4 mb-2" />
      </div>
      <main className="flex-grow px-4 md:px-6">
        <div className="container mx-auto">
          <Outlet context={{ departments }} />
        </div>
      </main>
      <ModernFooter />
    </div>
  );
}