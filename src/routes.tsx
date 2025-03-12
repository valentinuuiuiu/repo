import { createBrowserRouter } from "react-router-dom";
import Home from "./components/home";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/dashboard",
    element: <Home />,
  },
  {
    path: "/orders",
    element: <Orders />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/analytics",
    element: <Analytics />,
  },
  {
    path: "/suppliers",
    element: <Suppliers />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/ai/tasks",
    element: <AITasks />,
  },
  {
    path: "/ai/chat",
    element: <AIChat />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
]);
