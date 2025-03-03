import { prisma } from "../prisma";
import type { Product, Prisma } from "@prisma/client";
import { redis } from '@/lib/redis';

// Helper function to determine if browser environment
const isBrowser = () => typeof window !== 'undefined';

// API endpoint for products (used in browser)
const API_URL = '/api/products';

export const productService = {
  async list(params: {
    search?: string;
    category?: string;
    supplierId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    // In browser environment, make API request to server
    if (isBrowser()) {
      try {
        // Convert params to query string
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
        
        const response = await fetch(`${API_URL}?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching products from API:", error);
        throw error;
      }
    }

    // Server-side code using Prisma
    const {
      search,
      category,
      supplierId,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      page = 1,
      limit = 20,
    } = params;
    
    // Build Prisma where clause
    const where: Prisma.ProductWhereInput = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        category && category !== 'all' ? { category } : {},
        supplierId ? { supplierId } : {},
        minPrice ? { price: { gte: minPrice } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},
        minRating ? { supplier: { rating: { gte: minRating } } } : {},
        inStock !== undefined ? { inventory: inStock ? { gt: 0 } : { lte: 0 } } : {}
      ]
    };

    // Try to get from cache first
    const cacheKey = `products:${JSON.stringify(params)}`;
    try {
      const cachedData = await redis.redisClient.get(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return {
          products: parsed,
          pagination: {
            page,
            limit,
            total: parsed.length,
            pages: Math.ceil(parsed.length / limit),
          },
        };
      }
    } catch (error) {
      console.error("Redis cache error:", error);
      // Continue with database query if cache fails
    }

    try {
      // Get total count for pagination
      const total = await prisma.product.count({ where });
      
      // Get paginated products
      let products = await prisma.product.findMany({
        where,
        include: {
          supplier: {
            select: {
              name: true,
              rating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
      
      // Add missing properties
      products = products.map(product => ({
        ...product,
        image: product.images && product.images.length > 0 ? product.images[0] : '/default-image.png',
        supplierRating: product.supplier?.rating || 0,
        inStock: product.inventory > 0,
      }));
      
      // Cache results in Redis for performance
      try {
        await redis.redisClient.set(cacheKey, JSON.stringify(products));
        await redis.redisClient.expire(cacheKey, 300); // Cache for 5 minutes
      } catch (cacheError) {
        console.error("Redis cache set error:", cacheError);
        // Continue even if caching fails
      }
      
      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching products from Prisma:", error);
      throw error;
    }
  },

  async create(data: Prisma.ProductCreateInput) {
    if (isBrowser()) {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    }

    const product = await prisma.product.create({
      data,
      include: {
        supplier: {
          select: {
            name: true,
            rating: true
          }
        }
      }
    });
    
    // Invalidate relevant Redis caches
    try {
      await redis.redisClient.del(`products:${JSON.stringify({})}`);
    } catch (error) {
      console.error("Redis cache invalidation error:", error);
    }
    
    return product;
  },
  
  async update(id: string, data: Prisma.ProductUpdateInput) {
    if (isBrowser()) {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        supplier: {
          select: {
            name: true,
            rating: true
          }
        }
      }
    });
    
    // Invalidate relevant Redis caches
    try {
      await redis.redisClient.del(`products:${JSON.stringify({id})}`);
    } catch (error) {
      console.error("Redis cache invalidation error:", error);
    }
    
    return product;
  },
  
  async delete(id: string) {
    if (isBrowser()) {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    }

    const product = await prisma.product.delete({
      where: { id }
    });
    
    // Invalidate relevant Redis caches
    try {
      await redis.redisClient.del(`products:${JSON.stringify({id})}`);
    } catch (error) {
      console.error("Redis cache invalidation error:", error);
    }
    
    return product;
  }
};
