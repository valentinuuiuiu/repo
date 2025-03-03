import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Menu, 
  X, 
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '../ui/theme-toggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface Department {
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

interface NavbarProps {
  departments?: Department[];
}

const Navbar = ({ departments = [] }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if user is admin - this would normally come from auth context
  const isAdmin = false; // Replace with actual auth check

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Suppliers', path: '/dashboard/suppliers' },
    { name: 'Features', path: '/features' },
    { name: 'Departments', path: '/departments' },
    { name: 'Agents', path: '/agents' },
    { name: 'About', path: '/about' },
  ];

  const platformLinks = [
    { name: 'All Platforms', path: '/platforms' },
    { name: 'Alibaba', path: '/platforms/alibaba' },
    { name: 'AliExpress', path: '/platforms/aliexpress' },
    { name: 'eBay', path: '/platforms/ebay' },
    { name: 'eMAG', path: '/platforms/emag' },
    { name: 'GoMag', path: '/platforms/gomag' },
    { name: 'Shopify', path: '/platforms/shopify' },
    { name: 'Temu', path: '/platforms/temu' },
    { name: 'WooCommerce', path: '/platforms/woocommerce' },
  ];

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md shadow-md' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
              </motion.div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                DropConnect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`relative py-2 text-lg font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", bounce: 0.25 }}
                    />
                  )}
                </Link>
              ))}

              {/* Platforms Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="text" className="py-2 text-lg font-medium">
                    <span>Platforms</span>
                    <ChevronDown className="ml-2 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel className="text-base">E-commerce Platforms</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {platformLinks.map((platform) => (
                    <DropdownMenuItem key={platform.path} asChild className="text-base">
                      <Link to={platform.path}>{platform.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Button variant="text" size="icon" className="h-10 w-10">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="text" size="icon" className="h-10 w-10">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-base">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-base">
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-base">
                    <Link to="/dashboard/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-base">
                    <Link to="/dashboard/products">Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-base">
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="text-base">
                      <Link to="/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-base">
                    <Link to="/auth/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-base">
                    <Link to="/auth/register">Register</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="text" 
                size="icon"
                className="h-10 w-10 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-20 px-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xl font-medium ${
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Platforms Section */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Platforms</h3>
                <div className="grid grid-cols-2 gap-4">
                  {platformLinks.map((platform) => (
                    <Link
                      key={platform.path}
                      to={platform.path}
                      className="text-lg text-foreground hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {platform.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;