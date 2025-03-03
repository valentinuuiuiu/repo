import { redis } from "../redis";
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

    let orders = await redis.getAllOrders();

    // Apply filters
    orders = orders.filter((order: any) => {
      if (status && order.status !== status) return false;
      if (customerId && order.customerId !== customerId) return false;
      if (supplierId && order.supplierId !== supplierId) return false;

      const orderDate = new Date(order.createdAt);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;

      return true;
    });

    // Sort by createdAt
    orders.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      orders: orders.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async create(data: { order: Order, items: OrderItem[] }) {
    const id = `${Date.now()}`;
    const order = {
      
      ...data.order,
      items: data.items.map((item) => ({
        itemId: `${Date.now()}-${Math.random()}`,
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await redis.setOrder(id, order);
    await redis.incrementOrderCount();
    await redis.addToRevenue(order.total);

    return order;
  },

  async update(id: string, data: any) {
    const order = await redis.getOrder(id);
    if (!order) throw new Error("Order not found");

    const updatedOrder = {
      ...order,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await redis.setOrder(id, updatedOrder);
    return updatedOrder;
  },

  async delete(id: string) {
    const order = await redis.getOrder(id);
    if (!order) throw new Error("Order not found");
    await redis.redisClient.del(`order:${id}`);
    return order;
  },
};
