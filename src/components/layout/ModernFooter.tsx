import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { 
  ArrowRight,
  Mail,
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  YoutubeIcon,
  Heart 
} from 'lucide-react';

const ModernFooter = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Platforms', href: '/platforms' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Documentation', href: '/documentation' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
        { name: 'Partners', href: '/partners' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact', href: '/contact' },
        { name: 'API Status', href: '/status' },
        { name: 'Documentation', href: '/documentation' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/legal/terms-of-service' },
        { name: 'Privacy Policy', href: '/legal/privacy-policy' },
        { name: 'Cookie Policy', href: '/legal/cookie-policy' },
        { name: 'Accessibility', href: '/legal/accessibility' },
      ]
    },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-3">Stay in the loop</h3>
              <p className="text-lg text-muted-foreground">
                Subscribe to our newsletter for the latest product updates, promotions, and dropshipping tips.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="pl-12 h-12 text-base rounded-lg"
                />
              </div>
              <Button size="lg" className="h-12 px-8 text-base group">
                Subscribe
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                DropConnect
              </span>
            </Link>
            
            <p className="text-lg text-muted-foreground mb-8">
              A comprehensive dropshipping solution helping merchants discover, manage, and sync products from multiple suppliers to their e-commerce stores.
            </p>
            
            <div className="flex space-x-4">
              {[
                { icon: <FacebookIcon />, label: 'Facebook', href: '#' },
                { icon: <TwitterIcon />, label: 'Twitter', href: '#' },
                { icon: <InstagramIcon />, label: 'Instagram', href: '#' },
                { icon: <LinkedinIcon />, label: 'LinkedIn', href: '#' },
                { icon: <YoutubeIcon />, label: 'YouTube', href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
                  whileHover={{ y: -5 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h4 className="text-xl font-semibold mb-6">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.href}
                      className="text-base text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="py-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-muted-foreground mb-4 md:mb-0">
            © {currentYear} DropConnect. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <img 
              src="/images/payment/visa.svg" 
              alt="Visa" 
              className="h-8"
            />
            <img 
              src="/images/payment/mastercard.svg" 
              alt="Mastercard" 
              className="h-8"
            />
            <img 
              src="/images/payment/amex.svg" 
              alt="American Express" 
              className="h-8"
            />
            <img 
              src="/images/payment/paypal.svg" 
              alt="PayPal" 
              className="h-8"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;