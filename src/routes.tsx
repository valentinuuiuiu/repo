import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModernEcommerceLayout from './components/layout/ModernEcommerceLayout';
import * as LazyComponents from './lib/lazy-components';

// Import all necessary pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/about';
import FeaturesPage from './pages/features';
import SuppliersPage from './pages/suppliers';
import PlatformsPage from './pages/platforms';
import SolutionsPage from './pages/solutions';
import BlogPage from './pages/blog';
import PressPage from './pages/press';
import CareersPage from './pages/careers';
import HelpCenterPage from './pages/help';
import DocumentationPage from './pages/documentation';
import ContactPage from './pages/contact';
import TermsOfServicePage from './pages/legal/terms-of-service';
import PrivacyPolicyPage from './pages/legal/privacy-policy';
import CookiePolicyPage from './pages/legal/cookie-policy';
import AccessibilityPage from './pages/legal/accessibility';
import SitemapPage from './pages/sitemap';
import StatusPage from './pages/status';
import PartnersPage from './pages/partners';
import ApiDocsPage from './pages/api';

const { 
  Login, Orders, Analytics, Products, 
  Settings, AgentTestPage, AgentDashboard, AgentNetworkPage,
  AlibabaPlatform, AliExpressPlatform, EbayPlatform, EmagPlatform, 
  GomagPlatform, ShopifyPlatform, TemuPlatform, WooCommercePlatform,
  DepartmentLayout, Profile, AdminDashboard,
  Suppliers
} = LazyComponents;

// Mock departments for development/fallback
const mockDepartments = [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    code: 'ECM',
    description: 'E-commerce Department',
    stats: { products: 500, suppliers: 250, agents: 20 }
  },
  {
    id: 'logistics',
    name: 'Logistics',
    code: 'LOG',
    description: 'Logistics Department',
    stats: { products: 0, suppliers: 50, agents: 8 }
  }
];

// Mock data for initial props
const mockProductData = [
  {
    id: 'mock-1',
    title: 'Sample Product',
    description: 'A sample product for testing',
    compareAtPrice: 129.99,
    costPrice: 79.99,
    price: 99.99,
    inventory: 100,
    status: 'active',
    images: [],
    variants: [],
    metadata: {},
    supplier: {
      name: 'Sample Supplier',
      rating: 4.5
    },
    department: {
      id: 'default',
      name: 'Default'
    }
  }
];

const mockSupplierData = [
  {
    id: 'mock-1',
    name: 'Sample Supplier',
    email: 'supplier@example.com',
    website: 'https://supplier.example.com',
    location: 'US',
    rating: 4.5,
    fulfillmentSpeed: 95,
    qualityScore: 4.8,
    communicationScore: 4.7,
    productsCount: 1000,
    onTimeDelivery: 98,
    metadata: {},
    integration: 'api',
    status: 'active',
    productCount: 1000,
    orderCount: 500
  }
];

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  stats: {
    products: number;
    suppliers: number;
    agents: number;
  };
}

export const AppRoutes = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/departments`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Expected JSON response from API");
        }
        
        const data = await response.json();
        if (Array.isArray(data)) {
          // Transform the data to ensure each department has a stats object
          const transformedData = data.map(dept => ({
            ...dept,
            stats: {
              products: dept.stats?.products || dept._count?.products || 0,
              suppliers: dept.stats?.suppliers || dept._count?.suppliers || 0, 
              agents: dept.stats?.agents || dept._count?.agents || 0
            }
          }));
          setDepartments(transformedData);
        } else {
          throw new Error("Invalid data format from API");
        }
      } catch (error) {
        console.warn('Using mock departments data:', error);
        setDepartments(mockDepartments);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <Routes>
      <Route element={<ModernEcommerceLayout departments={departments} />}>
        {/* Main Pages */}
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="solutions" element={<SolutionsPage />} />

        {/* Platform Pages */}
        <Route path="platforms">
          <Route index element={<PlatformsPage />} />
          <Route path="alibaba/*" element={<AlibabaPlatform />} />
          <Route path="aliexpress/*" element={<AliExpressPlatform />} />
          <Route path="ebay/*" element={<EbayPlatform />} />
          <Route path="emag/*" element={<EmagPlatform />} />
          <Route path="gomag/*" element={<GomagPlatform />} />
          <Route path="shopify/*" element={<ShopifyPlatform />} />
          <Route path="temu/*" element={<TemuPlatform />} />
          <Route path="woocommerce/*" element={<WooCommercePlatform />} />
        </Route>

        {/* Blog & Press */}
        <Route path="blog" element={<BlogPage />} />
        <Route path="press" element={<PressPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="partners" element={<PartnersPage />} />

        {/* Support & Help */}
        <Route path="help" element={<HelpCenterPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="api" element={<ApiDocsPage />} />

        {/* Legal Pages */}
        <Route path="legal">
          <Route path="terms-of-service" element={<TermsOfServicePage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="cookie-policy" element={<CookiePolicyPage />} />
          <Route path="accessibility" element={<AccessibilityPage />} />
        </Route>

        {/* Sitemap */}
        <Route path="sitemap" element={<SitemapPage />} />

        {/* Protected Routes */}
        <Route path="auth/login" element={<Login />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="dashboard/analytics" element={<Analytics />} />
        <Route path="dashboard/products" element={<Products departmentId="default" initialData={mockProductData} />} />
        <Route path="dashboard/orders" element={<Orders />} />
        <Route path="dashboard/suppliers" element={<Suppliers departmentId="default" suppliers={mockSupplierData} />} />
        <Route path="departments" element={
          <DepartmentLayout departments={departments}>
            <div>Department Content</div>
          </DepartmentLayout>
        } />
        <Route path="agents" element={<AgentDashboard />} />
        <Route path="agents/network" element={<AgentNetworkPage />} />
        <Route path="agents/test" element={<AgentTestPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};