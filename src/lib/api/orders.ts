import { prisma } from "../prisma";
import { Order, OrderItem } from "@prisma/client";

export const orderService = {
  async list(params: {
    status?: string;
    customerId?: string;
    supplierId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      customerId,
      supplierId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = params;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.order.count({ where });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async create(data: {
    order: Omit<Order, "id" | "createdAt" | "updatedAt">;
    items: Omit<OrderItem, "id" | "orderId" | "createdAt" | "updatedAt">[];
  }) {
    return prisma.order.create({
      data: {
        ...data.order,
        items: {
          create: data.items,
        },
      },
      include: {
        customer: true,
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });
  },

  async update(id: string, data: Partial<Order>) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        customer: true,
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  },
};
