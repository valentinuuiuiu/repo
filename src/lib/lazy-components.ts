import { lazy } from 'react';

// Core pages
export const HomePage = lazy(() => import('../pages/HomePage'));
export const Login = lazy(() => import('../components/auth/Login'));
export const Orders = lazy(() => import('../components/dashboard/Orders'));
export const Analytics = lazy(() => import('../components/dashboard/Analytics'));

// Fix imports that don't have default exports
export const Suppliers = lazy(() => import('../components/dashboard/DepartmentSuppliers').then(module => ({ default: module.DepartmentSuppliers })));
export const About = lazy(() => import('../components/about/About'));
export const Products = lazy(() => import('../components/dashboard/DepartmentProducts').then(module => ({ default: module.DepartmentProducts })));
export const Settings = lazy(() => import('../components/dashboard/Settings'));
export const FeaturesPage = lazy(() => import('../pages/features'));

// Agent related pages
export const AgentTestPage = lazy(() => import('../pages/AgentTestPage'));
export const AgentDashboard = lazy(() => import('../components/dashboard/AgentDashboard'));
export const AgentNetworkPage = lazy(() => import('../pages/agent-network'));

// Platform pages - using correct relative paths
export const AlibabaPlatform = lazy(() => import('../../pages/alibaba').then(module => ({ default: module.default })));
export const AliExpressPlatform = lazy(() => import('../../pages/aliexpress').then(module => ({ default: module.default })));
export const EbayPlatform = lazy(() => import('../../pages/ebay').then(module => ({ default: module.default })));
export const EmagPlatform = lazy(() => import('../../pages/emag').then(module => ({ default: module.default })));
export const GomagPlatform = lazy(() => import('../../pages/gomag').then(module => ({ default: module.default })));
export const ShopifyPlatform = lazy(() => import('../../pages/shopify').then(module => ({ default: module.default })));
export const TemuPlatform = lazy(() => import('../../pages/temu').then(module => ({ default: module.default })));
export const WooCommercePlatform = lazy(() => import('../../pages/woocommerce').then(module => ({ default: module.default })));

// Layout components
export const Layout = lazy(() => import('../components/layout/Layout'));
export const PageLayout = lazy(() => import('../components/layout/PageLayout'));
export const DepartmentLayout = lazy(() => import('../components/DepartmentLayout'));
export const Profile = lazy(() => import('../components/profile/Profile'));
export const AdminDashboard = lazy(() => import('../pages/admin/dashboard'));