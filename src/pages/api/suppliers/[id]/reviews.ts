import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Mock reviews data for development
const mockReviews = {
  1: [
    {
      id: 1001,
      userId: 'user123',
      userName: 'John Smith',
      rating: 5,
      comment: 'Excellent supplier! Products arrived on time and were exactly as described. Will definitely order again.',
      date: '2023-10-15'
    },
    {
      id: 1002,
      userId: 'user456',
      userName: 'Sarah Johnson',
      rating: 4,
      comment: 'Good quality products and responsive communication. Shipping was a bit slow but overall a good experience.',
      date: '2023-09-28'
    }
  ],
  2: [
    {
      id: 2001,
      userId: 'user789',
      userName: 'Michael Brown',
      rating: 5,
      comment: 'The clothing items were high quality and my customers love them. Great supplier relationship.',
      date: '2023-10-10'
    },
    {
      id: 2002,
      userId: 'user101',
      userName: 'Emily Davis',
      rating: 4,
      comment: 'Fashion items were trendy and as described. Some minor issues with packaging but supplier was quick to resolve.',
      date: '2023-09-15'
    }
  ],
  3: [
    {
      id: 3001,
      userId: 'user202',
      userName: 'David Wilson',
      rating: 4,
      comment: 'Home decor items were beautiful and well-made. Reasonable prices too.',
      date: '2023-10-05'
    },
    {
      id: 3002,
      userId: 'user303',
      userName: 'Jennifer Lee',
      rating: 3,
      comment: 'Products are good but communication could be better. Had to follow up multiple times on my order status.',
      date: '2023-09-20'
    }
  ],
  4: [
    {
      id: 4001,
      userId: 'user404',
      userName: 'Robert Taylor',
      rating: 5,
      comment: 'Tech products were cutting-edge and high quality. Fast shipping and great customer service.',
      date: '2023-10-12'
    },
    {
      id: 4002,
      userId: 'user505',
      userName: 'Lisa Anderson',
      rating: 5,
      comment: 'One of the best electronics suppliers I\'ve worked with. Responsive and reliable.',
      date: '2023-09-30'
    }
  ],
  5: [
    {
      id: 5001,
      userId: 'user606',
      userName: 'Thomas Martin',
      rating: 5,
      comment: 'Love the eco-friendly products! My customers appreciate the sustainable options.',
      date: '2023-10-08'
    },
    {
      id: 5002,
      userId: 'user707',
      userName: 'Amanda White',
      rating: 4,
      comment: 'Great sustainable products with proper certifications. Packaging could be improved.',
      date: '2023-09-25'
    }
  ],
  6: [
    {
      id: 6001,
      userId: 'user808',
      userName: 'Jessica Clark',
      rating: 4,
      comment: 'Beauty products are high quality and my customers love them. Shipping was prompt.',
      date: '2023-10-14'
    },
    {
      id: 6002,
      userId: 'user909',
      userName: 'Daniel Lewis',
      rating: 5,
      comment: 'Premium cosmetics at competitive prices. Great supplier relationship.',
      date: '2023-09-22'
    }
  ]
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supplierId = parseInt(id as string);

  if (isNaN(supplierId)) {
    return res.status(400).json({ error: 'Invalid supplier ID' });
  }

  // Handle GET request to fetch reviews
  if (req.method === 'GET') {
    try {
      // Get reviews for the specified supplier
      const reviews = mockReviews[supplierId as keyof typeof mockReviews] || [];
      
      return res.status(200).json(reviews);
    } catch (error) {
      console.error(`Error fetching reviews for supplier ID ${supplierId}:`, error);
      return res.status(500).json({ error: 'Failed to fetch supplier reviews' });
    }
  } 
  // Handle POST request to submit a review
  else if (req.method === 'POST') {
    try {
      const { rating, comment } = req.body;
      
      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 5.' });
      }
      
      if (!comment || comment.trim() === '') {
        return res.status(400).json({ error: 'Comment is required.' });
      }
      
      // In a real implementation, we would:
      // 1. Verify the user is authenticated
      // 2. Check if the user has purchased from this supplier
      // 3. Create a review record in the database
      
      // For now, we'll simulate a successful review submission
      
      // Simulate a delay to mimic database operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.status(200).json({ 
        success: true, 
        message: 'Review submitted successfully.' 
      });
    } catch (error) {
      console.error(`Error submitting review for supplier ID ${supplierId}:`, error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to submit review' 
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}