import { createBrowserRouter } from "react-router-dom";
import Home from "./components/home";
import Login from "./pages/auth/login";
import Orders from "./pages/dashboard/orders";
import Analytics from "./pages/dashboard/analytics";
import Suppliers from "./pages/dashboard/suppliers";
import AdminDashboard from "./pages/admin/dashboard";

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
    path: "/dashboard",
    element: <Home />,
  },
  {
    path: "/orders",
    element: <Orders />,
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
    path: "/admin",
    element: <AdminDashboard />,
  },
]);
