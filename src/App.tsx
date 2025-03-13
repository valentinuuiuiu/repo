import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import Orders from "./pages/dashboard/orders";
import Analytics from "./pages/dashboard/analytics";
import Suppliers from "./pages/dashboard/suppliers";
import Products from "./pages/dashboard/products";
import Settings from "./pages/dashboard/settings";
import Profile from "./pages/profile";
import AdminDashboard from "./pages/admin/dashboard";
import AITasks from "./pages/ai/tasks";
import AIChat from "./pages/ai/chat";
import CheckoutPage from "./pages/checkout";
import { ToastListener } from "./components/dashboard/ToastListener";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Loading...</span>
        </div>
      }
    >
      {/* For the tempo routes */}
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/ai/tasks" element={<AITasks />} />
        <Route path="/ai/chat" element={<AIChat />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Add this before the catchall route */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global toast listener */}
      <ToastListener />
      <Toaster />
    </Suspense>
  );
}

export default App;
