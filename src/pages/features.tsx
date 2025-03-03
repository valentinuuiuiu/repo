import styles from "./features.module.css";
import PageLayout from "@/components/layout/PageLayout";
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  ShoppingBag, 
  BarChart, 
  Truck, 
  CreditCard, 
  Search,
  Zap,
  Database,
  Shield,
  RefreshCw,
  Smartphone,
  MessageSquare
} from 'lucide-react';

const FeaturesPage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Globe className="w-12 h-12 text-primary" />,
      title: 'Global Supplier Network',
      description: 'Connect with verified suppliers from Alibaba, AliExpress, Temu, and more with our seamless integration system.'
    },
    {
      icon: <ShoppingBag className="w-12 h-12 text-primary" />,
      title: 'Multi-Channel Sales',
      description: 'Sell your products across Shopify, WooCommerce, eBay, Amazon, and other major platforms from a single dashboard.'
    },
    {
      icon: <Zap className="w-12 h-12 text-primary" />,
      title: 'Automated Order Fulfillment',
      description: 'Orders are automatically routed to the appropriate suppliers for direct shipping to your customers.'
    },
    {
      icon: <Database className="w-12 h-12 text-primary" />,
      title: 'Inventory Synchronization',
      description: 'Real-time inventory updates across all your sales channels to prevent overselling and stockouts.'
    },
    {
      icon: <BarChart className="w-12 h-12 text-primary" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting tools to track sales, identify trends, and optimize your product selection.'
    },
    {
      icon: <Truck className="w-12 h-12 text-primary" />,
      title: 'Shipping Management',
      description: 'Compare shipping options, track packages, and provide customers with real-time delivery updates.'
    },
    {
      icon: <CreditCard className="w-12 h-12 text-primary" />,
      title: 'Secure Payment Processing',
      description: 'Integrated payment solutions with fraud protection to ensure secure transactions for you and your customers.'
    },
    {
      icon: <Search className="w-12 h-12 text-primary" />,
      title: 'Product Research Tools',
      description: 'Discover trending products and analyze market demand to make data-driven inventory decisions.'
    },
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: 'Supplier Verification',
      description: 'All suppliers in our network undergo thorough verification to ensure reliability and product quality.'
    },
    {
      icon: <RefreshCw className="w-12 h-12 text-primary" />,
      title: 'Automated Returns',
      description: 'Streamlined return process with automated handling of customer requests and supplier coordination.'
    },
    {
      icon: <Smartphone className="w-12 h-12 text-primary" />,
      title: 'Mobile Management',
      description: 'Manage your dropshipping business on the go with our fully-featured mobile application.'
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-primary" />,
      title: 'AI Support Assistant',
      description: 'Get instant help with our AI-powered support system that can answer questions and solve common issues.'
    }
  ];

  return (
    <PageLayout>
      <div className={styles.featuresContainer}>
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <h1 className="text-4xl font-bold mb-6">Powerful Features for Dropshipping Success</h1>
          <p className="text-xl text-muted-foreground">
            Our comprehensive platform provides everything you need to build and scale your dropshipping business from anywhere in the world.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
              Start Free Trial
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-md font-medium hover:bg-primary/10 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FeaturesPage;