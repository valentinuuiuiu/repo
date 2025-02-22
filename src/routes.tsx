import { createBrowserRouter, Navigate } from "react-router-dom";
import Home from "./components/home";
import Login from "./pages/auth/login";
import Orders from "./pages/dashboard/orders";
import Analytics from "./pages/dashboard/analytics";
import Suppliers from "./pages/dashboard/suppliers";
import AdminDashboard from "./pages/admin/dashboard";
import About from "./pages/about";
import Layout from "./components/layout/Layout";
import Products from "./pages/dashboard/products";
import Settings from "./pages/dashboard/settings";
import TermsOfService from "./pages/terms-of-service";
import PrivacyPolicyPage from "./pages/privacy-policy";
import ContactUsPage from "./pages/contact-us";
import HelpSupportPage from "./pages/help-support";
import PageLayout from "./components/layout/PageLayout";
import BlogPage from "./pages/blog";
import SupportPage from "./pages/support";
import DocumentationPage from "./pages/documentation";
import ApiPage from "./pages/api";
import PricingPage from "./pages/pricing";
import FeaturesPage from "./pages/features";
import { CodeMaintenance } from "./components/ai/CodeMaintenance";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/analytics" replace />,
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
    path: "/dashboard",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
    {
      path: "/help-support",
      Component: HelpSupportPage,
    },
    {
      path: "/privacy-policy",
      Component: PrivacyPolicyPage,
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
    path: "/terms-of-service",
    element: (
      <Layout showSidebar={false}>
        <TermsOfService />
      </Layout>
    ),
  },
  {
    path: "/privacy-policy",
    element: (
      <Layout showSidebar={false}>
        <PrivacyPolicyPage />
      </Layout>
    ),
  },
  {
    path: "/contact-us",
    element: (
      <Layout showSidebar={false}>
        <ContactUsPage />
      </Layout>
    ),
  },
  {
    path: "/help-support",
    element: (
      <Layout showSidebar={false}>
        <HelpSupportPage />
      </Layout>
    ),
  },
  {
    path: "/blog",
    element: (
      <PageLayout>
        <BlogPage />
      </PageLayout>
    ),
  },
  {
    path: "/support",
    element: (
      <PageLayout>
        <SupportPage />
      </PageLayout>
    ),
  },
  {
    path: "/documentation",
    element: (
      <PageLayout>
        <DocumentationPage />
      </PageLayout>
    ),
  },
  {
    path: "/api",
    element: (
      <PageLayout>
        <ApiPage />
      </PageLayout>
    ),
  },
  {
    path: "/products",
    element: (
      <Layout>
        <Products />
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
    path: "/suppliers",
    element: (
      <Layout>
        <Suppliers />
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <Settings />
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
  {
    path: "/pricing",
    element: (
      <PageLayout>
        <PricingPage />
      </PageLayout>
    ),
  },
  {
    path: "/features",
    element: (
      <PageLayout>
        <FeaturesPage />
      </PageLayout>
    ),
  },
  {
    path: "/maintenance",
    element: (
      <Layout>
        <CodeMaintenance />
      </Layout>
    ),
  },
]);
