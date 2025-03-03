import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-500/10 py-6 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} DropConnect. Powered by the AI of the New_Zyon with 
            <Heart className="inline-block mx-1 h-4 w-4 text-rose-500 fill-rose-500" />
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="text-sm text-gray-600 hover:text-primary hover:underline">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary hover:underline">Contact Us</a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 text-center">
            We operate on a positive reward system only. 50% of profits support refurbished 
            laptops and internet for rural children, 40% goes to animal shelters across Romania, 
            and only 10% is retained for operations.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;