type RedisClientType = import('redis').RedisClientType;
type RedisClient = RedisClientType & {
  // Define the methods we use from Redis client
  [key: string]: any;
  get: (key: string) => Promise<string|null>;
  set: (key: string, value: string) => Promise<void>;
  keys: (pattern: string) => Promise<string[]>;
  incr: (key: string) => Promise<number>;
  incrBy: (key: string, value: number) => Promise<number>;
  flushAll: () => Promise<void>;
};

let _redisClient: RedisClient; // Changed to _redisClient to indicate it's internal
const redisMockClient = new Proxy({}, {
  get() {
    throw new Error('Redis client can only be used server-side');
  }
}) as RedisClient;


async function initializeRedisClient(): Promise<RedisClient> {
  if (import.meta.env.SSR) { // Check if it's server-side rendering
    const serverRedisClient = await import('./redis.server');
    return serverRedisClient.default as RedisClient;
  } else {
    // Client-side: Return mock client
    return redisMockClient;
  }
}

export const redis = {
  // Initialize function to be called once on server-start
  async initialize(): Promise<void> {
    _redisClient = await initializeRedisClient();
  },

  get redisClient() { // Getter to access the initialized redisClient
    if (!_redisClient) throw new Error('Redis client not initialized. Call redis.initialize() first.');
    return _redisClient;
  },

  // Product related operations
  getProduct: async (id: string): Promise<any> => {
    const product = await (_redisClient || redisMockClient).get(`product:${id}`);
    return product ? JSON.parse(product) : null;
  },

  setProduct: async (id: string, product: any): Promise<void> => {
    await (_redisClient || redisMockClient).set(`product:${id}`, JSON.stringify(product));
  },

  getAllProducts: async (): Promise<any[]> => {
    const keys = await (_redisClient || redisMockClient).keys("product:*");
    const products = await Promise.all(
      keys.map(async (key: string) => {
        const product = await (_redisClient || redisMockClient).get(key);
        return product ? JSON.parse(product) : null;
      }),
    );
    return products.filter(Boolean);
  },

  // Order related operations
  getOrder: async (id: string): Promise<any> => {
    const order = await (_redisClient || redisMockClient).get(`order:${id}`);
    return order ? JSON.parse(order) : null;
  },

  setOrder: async (id: string, order: any): Promise<void> => {
    await (_redisClient || redisMockClient).set(`order:${id}`, JSON.stringify(order));
  },

  getAllOrders: async (): Promise<any[]> =>  {
    const keys = await (_redisClient || redisMockClient).keys("order:*");
    const orders = await Promise.all(
      keys.map(async (key: string) => {
        const order = await (_redisClient || redisMockClient).get(key);
        return order ? JSON.parse(order) : null;
      }),
    );
    return orders.filter(Boolean);
  },

  // Supplier related operations
  getSupplier: async (id: string): Promise<any> => {
    const supplier = await (_redisClient || redisMockClient).get(`supplier:${id}`);
    return supplier ? JSON.parse(supplier) : null;
  },

  setSupplier: async (id: string, supplier: any): Promise<void> => {
    await (_redisClient || redisMockClient).set(`supplier:${id}`, JSON.stringify(supplier));
  },

  getAllSuppliers: async (): Promise<any[]> => {
    const keys = await (_redisClient || redisMockClient).keys("supplier:*");
    const suppliers = await Promise.all(
      keys.map(async (key: string) => {
        const supplier = await (_redisClient || redisMockClient).get(key);
        return supplier ? JSON.parse(supplier) : null;
      }),
    );
    return suppliers.filter(Boolean);
  },

  // Analytics related operations
  incrementOrderCount: async (): Promise<number> => {
    return (_redisClient || redisMockClient).incr("stats:order_count");
  },

  addToRevenue: async (amount: number): Promise<number> => {
    return (_redisClient || redisMockClient).incrBy("stats:total_revenue", amount);
  },

  getAnalytics: async (): Promise<any> => {
    const [orderCount, totalRevenue] = await Promise.all([
      (_redisClient || redisMockClient).get("stats:order_count"),
      (_redisClient || redisMockClient).get("stats:total_revenue"),
    ]);

    return {
      orderCount: parseInt(orderCount || "0"),
      totalRevenue: parseInt(totalRevenue || "0"),
    };
  },

  // Cache management
  clearCache: async (): Promise<void> => {
    await (_redisClient || redisMockClient).flushAll();
  },
};
