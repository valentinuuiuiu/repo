import { redisClient } from "../redis";
import { Product } from "@prisma/client";

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

    let products = await redisClient.getAllProducts();

    // Apply filters
    products = products.filter((product) => {
      if (
        search &&
        !(
          product.title.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;

      if (category && product.category !== category) return false;
      if (supplierId && product.supplierId !== supplierId) return false;
      if (minPrice && product.price < minPrice) return false;
      if (maxPrice && product.price > maxPrice) return false;
      if (minRating && product.supplier.rating < minRating) return false;
      if (inStock !== undefined) {
        if (inStock && product.inventory <= 0) return false;
        if (!inStock && product.inventory > 0) return false;
      }

      return true;
    });

    // Sort by createdAt
    products.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = products.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      products: products.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async create(data: any) {
    const id = `${Date.now()}`;
    const product = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await redisClient.setProduct(id, product);
    return product;
  },

  async update(id: string, data: any) {
    const product = await redisClient.getProduct(id);
    if (!product) throw new Error("Product not found");

    const updatedProduct = {
      ...product,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await redisClient.setProduct(id, updatedProduct);
    return updatedProduct;
  },

  async delete(id: string) {
    const product = await redisClient.getProduct(id);
    if (!product) throw new Error("Product not found");
    await redis.del(`product:${id}`);
    return product;
  },
};
