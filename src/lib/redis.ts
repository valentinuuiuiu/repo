type RedisClientType = import('redis').RedisClientType;
type RedisClient = RedisClientType | {
  [key: string]: any;
  get: (key: string) => Promise<string|null>;
  set: (key: string, value: string) => Promise<void>;
  keys: (pattern: string) => Promise<string[]>;
  incr: (key: string) => Promise<number>;
  incrBy: (key: string, value: number) => Promise<number>;
  flushAll: () => Promise<void>;
};

let redisClient: RedisClient;

if (import.meta.env.SSR) {
  // Server-side configuration
  const { createClient } = await import('redis');
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 10000)
    }
  });

  redisClient.on('error', err => console.error('Redis Client Error:', err));
  await redisClient.connect();
} else {
  // Client-side mock
  redisClient = new Proxy({}, {
    get() {
      throw new Error('Redis client can only be used server-side');
    }
  }) as RedisClient;
}

export { redisClient };
export const redis = {
  // Product related operations
  async getProduct(id: string) {
    const product = await redisClient.get(`product:${id}`);
    return product ? JSON.parse(product) : null;
  },

  async setProduct(id: string, product: any) {
    await redisClient.set(`product:${id}`, JSON.stringify(product));
  },

  async getAllProducts() {
    const keys = await redisClient.keys("product:*");
    const products = await Promise.all(
      keys.map(async (key) => {
        const product = await redisClient.get(key);
        return product ? JSON.parse(product) : null;
      }),
    );
    return products.filter(Boolean);
  },

  // Order related operations
  async getOrder(id: string) {
    const order = await redisClient.get(`order:${id}`);
    return order ? JSON.parse(order) : null;
  },

  async setOrder(id: string, order: any) {
    await redisClient.set(`order:${id}`, JSON.stringify(order));
  },

  async getAllOrders() {
    const keys = await redisClient.keys("order:*");
    const orders = await Promise.all(
      keys.map(async (key) => {
        const order = await redisClient.get(key);
        return order ? JSON.parse(order) : null;
      }),
    );
    return orders.filter(Boolean);
  },

  // Supplier related operations
  async getSupplier(id: string) {
    const supplier = await redisClient.get(`supplier:${id}`);
    return supplier ? JSON.parse(supplier) : null;
  },

  async setSupplier(id: string, supplier: any) {
    await redisClient.set(`supplier:${id}`, JSON.stringify(supplier));
  },

  async getAllSuppliers() {
    const keys = await redisClient.keys("supplier:*");
    const suppliers = await Promise.all(
      keys.map(async (key) => {
        const supplier = await redisClient.get(key);
        return supplier ? JSON.parse(supplier) : null;
      }),
    );
    return suppliers.filter(Boolean);
  },

  // Analytics related operations
  async incrementOrderCount() {
    return redisClient.incr("stats:order_count");
  },

  async addToRevenue(amount: number) {
    return redisClient.incrBy("stats:total_revenue", amount);
  },

  async getAnalytics() {
    const [orderCount, totalRevenue] = await Promise.all([
      redisClient.get("stats:order_count"),
      redisClient.get("stats:total_revenue"),
    ]);

    return {
      orderCount: parseInt(orderCount || "0"),
      totalRevenue: parseInt(totalRevenue || "0"),
    };
  },

  // Cache management
  async clearCache() {
    await redisClient.flushAll();
  },
};
