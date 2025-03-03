import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Heart, 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from '../ui/card';
import { cn } from '@/lib/utils';

// Mock product data - replace with actual data from your API
const mockProducts = [
  {
    id: 1,
    name: 'Eco-Friendly Water Bottle',
    description: 'Sustainable stainless steel water bottle with thermal insulation.',
    price: 24.99,
    rating: 4.8,
    reviewCount: 124,
    image: 'https://placehold.co/300x300/4f46e5/ffffff?text=Eco+Bottle',
    category: 'Home',
    isNew: true,
    isFeatured: true,
    discount: 0,
  },
  {
    id: 2,
    name: 'Organic Cotton T-Shirt',
    description: 'Made from 100% organic cotton, eco-friendly and comfortable.',
    price: 29.99,
    rating: 4.5,
    reviewCount: 89,
    image: 'https://placehold.co/300x300/4f46e5/ffffff?text=Organic+Shirt',
    category: 'Clothing',
    isNew: false,
    isFeatured: true,
    discount: 15,
  },
  {
    id: 3,
    name: 'Bamboo Toothbrush Set',
    description: 'Pack of 4 biodegradable bamboo toothbrushes with charcoal bristles.',
    price: 12.99,
    rating: 4.7,
    reviewCount: 56,
    image: 'https://placehold.co/300x300/4f46e5/ffffff?text=Bamboo+Brush',
    category: 'Personal Care',
    isNew: true,
    isFeatured: true,
    discount: 0,
  },
  {
    id: 4,
    name: 'Solar Power Bank',
    description: 'Charge your devices on the go with this solar-powered battery pack.',
    price: 49.99,
    rating: 4.6,
    reviewCount: 42,
    image: 'https://placehold.co/300x300/4f46e5/ffffff?text=Solar+Bank',
    category: 'Electronics',
    isNew: false,
    isFeatured: true,
    discount: 10,
  },
  {
    id: 5,
    name: 'Recycled Paper Notebook',
    description: 'Stylish notebook made from 100% recycled paper with a cork cover.',
    price: 14.99,
    rating: 4.4,
    reviewCount: 38,
    image: 'https://placehold.co/300x300/4f46e5/ffffff?text=Eco+Notebook',
    category: 'Stationery',
    isNew: false,
    isFeatured: true,
    discount: 0,
  },
  {
    id: 6,
    name: 'Biodegradable Phone Case',
    description: 'Protect your phone with this stylish and eco-friendly phone case.',
    price: 19.99,
    rating: 4.3,
    reviewCount: 27,
    image: 'https://placehold.co/300x300/4f46e5/ffffff?text=Eco+Case',
    category: 'Accessories',
    isNew: true,
    isFeatured: true,
    discount: 5,
  },
];

const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 3;
  
  const categories = ['All', 'Home', 'Clothing', 'Electronics', 'Personal Care', 'Accessories', 'Stationery'];
  
  const filteredProducts = activeCategory === 'All' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === activeCategory);
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    currentPage * productsPerPage, 
    (currentPage + 1) * productsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl">
              Discover our curated selection of eco-friendly and sustainable products that combine style, functionality, and environmental consciousness.
            </p>
          </div>
          <Button variant="link" className="group mt-4 md:mt-0">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(0);
                }}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {displayedProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(index)}
                  className="w-8 h-8"
                >
                  {index + 1}
                </Button>
              ))}
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    rating: number;
    reviewCount: number;
    image: string;
    category: string;
    isNew: boolean;
    discount: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100) 
    : null;

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 h-full flex flex-col group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0 relative aspect-square overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          initial={false}
          animate={{ 
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.4 }}
        />
        
        {product.isNew && (
          <Badge className="absolute top-4 left-4 z-20">New</Badge>
        )}
        
        {product.discount > 0 && (
          <Badge variant="destructive" className="absolute top-4 right-4 z-20">
            {product.discount}% OFF
          </Badge>
        )}
        
        <motion.div 
          className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
        >
          <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" className="rounded-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </motion.div>
      </CardHeader>
      
      <CardContent className="flex-grow p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs font-normal">
            {product.category}
          </Badge>
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-primary text-primary mr-1" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center">
          {discountedPrice ? (
            <>
              <span className="font-bold text-lg">${discountedPrice.toFixed(2)}</span>
              <span className="text-muted-foreground line-through ml-2 text-sm">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button variant="outline" className="w-full group">
          <span>View Details</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeaturedProducts;