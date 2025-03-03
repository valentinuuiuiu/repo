import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '../ui/button';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  RefreshCw, 
  CreditCard, 
  Package 
} from 'lucide-react';

const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Secure Shopping",
      description: "Shop with confidence knowing your data is protected with enterprise-grade security."
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Fast Delivery",
      description: "Get your products delivered quickly with our optimized logistics network."
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Our customer support team is available around the clock to assist you."
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Easy Returns",
      description: "Not satisfied? Return your products hassle-free within 30 days."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Flexible Payments",
      description: "Choose from multiple payment options that suit your preferences."
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Quality Products",
      description: "All products are verified for quality and sustainability standards."
    }
  ];

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
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03]" />
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose <span className="text-primary">EcoSmart</span>
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We combine cutting-edge technology with eco-friendly practices to provide you with the best shopping experience while minimizing environmental impact.
          </motion.p>
        </div>

        <div ref={ref}>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </motion.div>
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button size="lg" className="group">
            Learn More About Our Features
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  feature: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="relative group"
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            type: "spring",
            delay: index * 0.1,
            duration: 0.5,
            bounce: 0.3
          } 
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
      
      <div className="relative bg-card hover:bg-card/50 border border-border hover:border-primary/20 rounded-xl p-8 h-full transition-colors duration-300">
        {/* 3D Tilt Effect */}
        <motion.div
          className="w-full h-full"
          style={{ 
            transformStyle: "preserve-3d",
            perspective: "1000px"
          }}
          animate={{
            rotateX: isHovered ? [0, -5, 0] : 0,
            rotateY: isHovered ? [0, 5, 0] : 0,
            z: isHovered ? 10 : 0
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary transition-transform duration-300 group-hover:scale-110">
            {feature.icon}
          </div>
          
          <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
          
          <p className="text-muted-foreground">
            {feature.description}
          </p>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
};

export default FeaturesSection;