import { NextApiRequest, NextApiResponse } from 'next';
import { productService } from '@/lib/api/products';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the product ID from the URL
    const { id } = req.query;
    const productId = id as string;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check method
    const { method } = req;

    // You may implement your own auth check here for PUT and DELETE methods
    // For example by checking a token in the Authorization header

    switch (method) {
      case 'GET':
        // Get a single product by ID
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            supplier: {
              select: {
                name: true,
                rating: true
              }
            }
          }
        });

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({
          ...product,
          image: product.images && product.images.length > 0 ? product.images[0] : '/default-image.png',
          supplierRating: product.supplier?.rating || 0,
          inStock: product.inventory > 0,
        });

      case 'PUT':
        // Update a product
        // Add your authentication logic here if needed
        
        const updateData = req.body;
        const updatedProduct = await productService.update(productId, updateData);
        return res.status(200).json(updatedProduct);

      case 'DELETE':
        // Delete a product
        // Add your authentication logic here if needed
        
        const deletedProduct = await productService.delete(productId);
        return res.status(200).json(deletedProduct);

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API error:', error);
    
    // Handle not found errors
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}