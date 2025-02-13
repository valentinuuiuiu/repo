import { ReactNode } from "react";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="p-4">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
      </header>
      <div className="flex-1 flex">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
