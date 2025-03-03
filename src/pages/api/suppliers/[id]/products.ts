import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Mock product data for development
const mockProducts = {
  1: [
    {
      id: 101,
      name: 'Wireless Bluetooth Earbuds',
      price: 29.99,
      moq: 50,
      leadTime: '7-10 days',
      category: 'Electronics',
      image: '/placeholder-product.png',
      description: 'High-quality wireless earbuds with noise cancellation and long battery life.'
    },
    {
      id: 102,
      name: 'Smart Watch with Health Tracking',
      price: 45.99,
      moq: 25,
      leadTime: '7-14 days',
      category: 'Electronics',
      image: '/placeholder-product.png',
      description: 'Feature-rich smartwatch with health monitoring and notification capabilities.'
    },
    {
      id: 103,
      name: 'Portable Power Bank 10000mAh',
      price: 15.50,
      moq: 100,
      leadTime: '5-7 days',
      category: 'Gadgets',
      image: '/placeholder-product.png',
      description: 'Compact power bank with fast charging capabilities for all mobile devices.'
    }
  ],
  2: [
    {
      id: 201,
      name: 'Premium Denim Jacket',
      price: 35.00,
      moq: 30,
      leadTime: '14-21 days',
      category: 'Clothing',
      image: '/placeholder-product.png',
      description: 'High-quality denim jacket with modern styling and durable construction.'
    },
    {
      id: 202,
      name: 'Leather Crossbody Bag',
      price: 28.50,
      moq: 20,
      leadTime: '10-15 days',
      category: 'Accessories',
      image: '/placeholder-product.png',
      description: 'Stylish leather crossbody bag with multiple compartments and adjustable strap.'
    }
  ],
  3: [
    {
      id: 301,
      name: 'Minimalist Wall Clock',
      price: 18.99,
      moq: 40,
      leadTime: '10-15 days',
      category: 'Home Decor',
      image: '/placeholder-product.png',
      description: 'Modern minimalist wall clock with silent movement and sleek design.'
    },
    {
      id: 302,
      name: 'Premium Knife Set',
      price: 65.00,
      moq: 15,
      leadTime: '14-21 days',
      category: 'Kitchen',
      image: '/placeholder-product.png',
      description: 'Professional-grade knife set with ergonomic handles and precision blades.'
    }
  ],
  4: [
    {
      id: 401,
      name: 'Smart Home Hub',
      price: 89.99,
      moq: 20,
      leadTime: '10-14 days',
      category: 'Smart Home',
      image: '/placeholder-product.png',
      description: 'Central hub for controlling all your smart home devices with voice commands.'
    },
    {
      id: 402,
      name: 'Wireless Charging Pad',
      price: 22.50,
      moq: 50,
      leadTime: '7-10 days',
      category: 'Electronics',
      image: '/placeholder-product.png',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices.'
    }
  ],
  5: [
    {
      id: 501,
      name: 'Bamboo Cutlery Set',
      price: 12.99,
      moq: 100,
      leadTime: '7-14 days',
      category: 'Sustainable',
      image: '/placeholder-product.png',
      description: 'Eco-friendly bamboo cutlery set with carrying case, perfect for on-the-go.'
    },
    {
      id: 502,
      name: 'Recycled Glass Vase',
      price: 24.50,
      moq: 30,
      leadTime: '10-15 days',
      category: 'Home Decor',
      image: '/placeholder-product.png',
      description: 'Beautiful vase made from 100% recycled glass with unique patterns.'
    }
  ],
  6: [
    {
      id: 601,
      name: 'Organic Face Serum',
      price: 18.99,
      moq: 50,
      leadTime: '7-14 days',
      category: 'Beauty',
      image: '/placeholder-product.png',
      description: 'Nourishing face serum made with organic ingredients for all skin types.'
    },
    {
      id: 602,
      name: 'Luxury Bath Bomb Set',
      price: 14.50,
      moq: 100,
      leadTime: '5-10 days',
      category: 'Personal Care',
      image: '/placeholder-product.png',
      description: 'Set of 6 luxury bath bombs with essential oils and natural ingredients.'
    }
  ]
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supplierId = parseInt(id as string);

  if (isNaN(supplierId)) {
    return res.status(400).json({ error: 'Invalid supplier ID' });
  }

  if (req.method === 'GET') {
    try {
      // Get products for the specified supplier
      const products = mockProducts[supplierId as keyof typeof mockProducts] || [];
      
      return res.status(200).json(products);
    } catch (error) {
      console.error(`Error fetching products for supplier ID ${supplierId}:`, error);
      return res.status(500).json({ error: 'Failed to fetch supplier products' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}