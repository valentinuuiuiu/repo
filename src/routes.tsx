import { createBrowserRouter } from "react-router-dom";
import Home from "./components/home";
import Login from "./pages/auth/login";
import Orders from "./pages/dashboard/orders";
import Analytics from "./pages/dashboard/analytics";
import Suppliers from "./pages/dashboard/suppliers";
import AdminDashboard from "./pages/admin/dashboard";
import About from "./pages/about";
import Layout from "./components/layout/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout showSidebar={false}>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout showSidebar={false}>
        <About />
      </Layout>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/orders",
    element: (
      <Layout>
        <Orders />
      </Layout>
    ),
  },
  {
    path: "/analytics",
    element: (
      <Layout>
        <Analytics />
      </Layout>
    ),
  },
  {
    path: "/suppliers",
    element: (
      <Layout>
        <Suppliers />
      </Layout>
    ),
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <AdminDashboard />
      </Layout>
    ),
  },
]);
