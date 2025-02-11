import { prisma } from "../prisma";
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

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (minRating) {
      where.supplier = {
        rating: { gte: minRating },
      };
    }

    if (inStock !== undefined) {
      where.inventory = inStock ? { gt: 0 } : { equals: 0 };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        supplier: true,
        variants: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.product.count({ where });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async create(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    return prisma.product.create({
      data,
      include: {
        supplier: true,
        variants: true,
      },
    });
  },

  async update(id: string, data: Partial<Product>) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        supplier: true,
        variants: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  },
};
