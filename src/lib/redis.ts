import { createClient } from '@redis/client';

const redis = createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
});

redis.on('error', err => console.log('Redis Client Error', err));

await redis.connect();

export const redisClient = {
  // Product related operations
  async getProduct(id: string) {
    const product = await redis.get(`product:${id}`);
    return product ? JSON.parse(product) : null;
  },

  async setProduct(id: string, product: any) {
    await redis.set(`product:${id}`, JSON.stringify(product));
  },

  async getAllProducts() {
    const keys = await redis.keys("product:*");
    const products = await Promise.all(
      keys.map(async (key) => {
        const product = await redis.get(key);
        return product ? JSON.parse(product) : null;
      }),
    );
    return products.filter(Boolean);
  },

  // Order related operations
  async getOrder(id: string) {
    const order = await redis.get(`order:${id}`);
    return order ? JSON.parse(order) : null;
  },

  async setOrder(id: string, order: any) {
    await redis.set(`order:${id}`, JSON.stringify(order));
  },

  async getAllOrders() {
    const keys = await redis.keys("order:*");
    const orders = await Promise.all(
      keys.map(async (key) => {
        const order = await redis.get(key);
        return order ? JSON.parse(order) : null;
      }),
    );
    return orders.filter(Boolean);
  },

  // Supplier related operations
  async getSupplier(id: string) {
    const supplier = await redis.get(`supplier:${id}`);
    return supplier ? JSON.parse(supplier) : null;
  },

  async setSupplier(id: string, supplier: any) {
    await redis.set(`supplier:${id}`, JSON.stringify(supplier));
  },

  async getAllSuppliers() {
    const keys = await redis.keys("supplier:*");
    const suppliers = await Promise.all(
      keys.map(async (key) => {
        const supplier = await redis.get(key);
        return supplier ? JSON.parse(supplier) : null;
      }),
    );
    return suppliers.filter(Boolean);
  },

  // Analytics related operations
  async incrementOrderCount() {
    return redis.incr("stats:order_count");
  },

  async addToRevenue(amount: number) {
    return redis.incrBy("stats:total_revenue", amount);
  },

  async getAnalytics() {
    const [orderCount, totalRevenue] = await Promise.all([
      redis.get("stats:order_count"),
      redis.get("stats:total_revenue"),
    ]);

    return {
      orderCount: parseInt(orderCount || "0"),
      totalRevenue: parseInt(totalRevenue || "0"),
    };
  },

  // Cache management
  async clearCache() {
    await redis.flushAll();
  },
};
