import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

interface EcommerceLayoutProps {
  children: ReactNode;
}

export default function EcommerceLayout({ children }: EcommerceLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">Store</Link>
          <nav className="space-x-6">
            <Link to="/products" className="hover:text-primary">Products</Link>
            <Link to="/categories" className="hover:text-primary">Categories</Link>
            <Link to="/cart" className="hover:text-primary">Cart</Link>
            <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}