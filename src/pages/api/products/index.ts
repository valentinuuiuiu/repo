import { NextApiRequest, NextApiResponse } from 'next';
import { productService } from '@/lib/api/products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check method
    const { method } = req;

    // You may implement your own auth check here
    // For example by checking a token in the Authorization header

    switch (method) {
      case 'GET':
        // Extract query parameters with correct types
        const {
          search,
          category,
          supplierId,
          page,
          limit,
          minPrice,
          maxPrice,
          minRating,
          inStock,
        } = req.query;

        const params = {
          search: search as string,
          category: category as string,
          supplierId: supplierId as string,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 20,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          minRating: minRating ? Number(minRating) : undefined,
          inStock: inStock ? inStock === 'true' : undefined,
        };

        const result = await productService.list(params);
        return res.status(200).json(result);

      case 'POST':
        // Create new product
        // You might want to implement auth check here for your app
        
        const data = req.body;
        const newProduct = await productService.create(data);
        return res.status(201).json(newProduct);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}