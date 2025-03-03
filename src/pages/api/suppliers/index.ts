import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Supplier } from '@/types/supplier';

// Mock data for development (will be replaced with database queries)
const mockSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Global Trends Wholesale',
    country: 'China',
    categories: ['Electronics', 'Gadgets'],
    rating: 4.7,
    productsCount: 5000,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Leading global supplier of cutting-edge electronics and innovative gadgets.',
    specialties: ['Dropshipping', 'Fast Shipping', 'Low MOQ']
  },
  {
    id: 2,
    name: 'Fashion Forward Imports',
    country: 'Vietnam',
    categories: ['Clothing', 'Accessories'],
    rating: 4.5,
    productsCount: 3500,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Premier supplier of trendy fashion items and accessories for online retailers.',
    specialties: ['Latest Trends', 'Custom Packaging', 'Quick Turnaround']
  },
  {
    id: 3,
    name: 'Home & Living Essentials',
    country: 'India',
    categories: ['Home Decor', 'Kitchen', 'Furniture'],
    rating: 4.3,
    productsCount: 2800,
    verified: false,
    logo: '/placeholder-supplier-logo.png',
    description: 'Comprehensive supplier of home goods and living essentials.',
    specialties: ['Wide Range', 'Competitive Pricing', 'Bulk Discounts']
  },
  {
    id: 4,
    name: 'Tech Innovations Supplier',
    country: 'South Korea',
    categories: ['Electronics', 'Gadgets', 'Smart Home'],
    rating: 4.8,
    productsCount: 4200,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Cutting-edge technology and smart home solutions for modern retailers.',
    specialties: ['Latest Tech', 'Innovative Products', 'Global Shipping']
  },
  {
    id: 5,
    name: 'Eco-Friendly Products Co.',
    country: 'Germany',
    categories: ['Sustainable', 'Home Decor', 'Lifestyle'],
    rating: 4.6,
    productsCount: 1800,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Sustainable and eco-friendly products for environmentally conscious retailers.',
    specialties: ['Eco-Friendly', 'Sustainable Materials', 'Carbon Neutral']
  },
  {
    id: 6,
    name: 'Beauty & Cosmetics Supply',
    country: 'France',
    categories: ['Beauty', 'Cosmetics', 'Personal Care'],
    rating: 4.4,
    productsCount: 2200,
    verified: true,
    logo: '/placeholder-supplier-logo.png',
    description: 'Premium beauty and cosmetics products from leading French manufacturers.',
    specialties: ['Organic Ingredients', 'Cruelty-Free', 'Luxury Packaging']
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Extract query parameters
      const { category, country, verified, search } = req.query;
      
      // Filter suppliers based on query parameters
      let filteredSuppliers = [...mockSuppliers];
      
      if (category) {
        filteredSuppliers = filteredSuppliers.filter(supplier => 
          supplier.categories.includes(category as string)
        );
      }
      
      if (country) {
        filteredSuppliers = filteredSuppliers.filter(supplier => 
          supplier.country.toLowerCase() === (country as string).toLowerCase()
        );
      }
      
      if (verified !== undefined) {
        const isVerified = verified === 'true';
        filteredSuppliers = filteredSuppliers.filter(supplier => 
          supplier.verified === isVerified
        );
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredSuppliers = filteredSuppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(searchTerm) ||
          supplier.description.toLowerCase().includes(searchTerm) ||
          supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
          supplier.specialties.some(spec => spec.toLowerCase().includes(searchTerm))
        );
      }
      
      // Return filtered suppliers
      return res.status(200).json(filteredSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}