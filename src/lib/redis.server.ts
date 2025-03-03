import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 10000)
  }
});

redisClient.on('error', err => console.error('Redis Client Error:', err));
redisClient.connect().catch(console.error);

export default redisClient;