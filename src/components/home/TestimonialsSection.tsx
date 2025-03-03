import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Mock testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Eco Enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=1',
    content: 'EcoSmart has completely transformed how I shop. The AI recommendations are spot-on, and I love that I can easily find sustainable products that align with my values.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Tech Professional',
    avatar: 'https://i.pravatar.cc/150?img=8',
    content: 'The user experience is phenomenal. Clean interface, fast checkout, and the chat assistant actually provides helpful guidance instead of generic responses.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Small Business Owner',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'As someone who values both quality and sustainability, EcoSmart delivers on all fronts. Their customer service is exceptional, and the product quality is consistently high.',
    rating: 4,
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Sustainability Consultant',
    avatar: 'https://i.pravatar.cc/150?img=3',
    content: 'I recommend EcoSmart to all my clients. Their commitment to eco-friendly products and transparent supply chain information sets them apart from other e-commerce platforms.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Aisha Patel',
    role: 'Lifestyle Blogger',
    avatar: 'https://i.pravatar.cc/150?img=10',
    content: 'The curated collections make it so easy to discover new sustainable brands. I appreciate how EcoSmart vets their suppliers for ethical practices and environmental impact.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  // Handle autoplay
  useEffect(() => {
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        nextTestimonial();
      }, 5000);
    }
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplay, activeIndex]);
  
  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Customer Testimonials
          </motion.span>
          
          <motion.h2 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            What Our Customers Say
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Don't just take our word for it. Here's what our community has to say about their EcoSmart shopping experience.
          </motion.p>
        </div>
        
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Large quote icon */}
          <div className="absolute -top-10 -left-10 text-primary/10">
            <Quote className="h-20 w-20" />
          </div>
          
          {/* Testimonial carousel */}
          <div className="relative overflow-hidden rounded-2xl bg-background border border-border p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`inline-block h-5 w-5 ${
                        i < testimonials[activeIndex].rating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-muted"
                      }`} 
                    />
                  ))}
                </div>
                
                <p className="text-lg md:text-xl italic mb-8">
                  "{testimonials[activeIndex].content}"
                </p>
                
                <Avatar className="h-16 w-16 mb-4 border-2 border-primary">
                  <AvatarImage src={testimonials[activeIndex].avatar} alt={testimonials[activeIndex].name} />
                  <AvatarFallback>{testimonials[activeIndex].name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <h4 className="font-semibold text-lg">{testimonials[activeIndex].name}</h4>
                <p className="text-muted-foreground">{testimonials[activeIndex].role}</p>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation buttons */}
            <div className="absolute top-1/2 left-4 -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={prevTestimonial}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={nextTestimonial}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Testimonial indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? "bg-primary w-6" 
                    : "bg-muted hover:bg-primary/50"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;