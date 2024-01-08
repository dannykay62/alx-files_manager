import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Promisifying Redis methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Handling error and connect events
    this.client.on('error', (error) => {
      console.log(`Redis client error: ${error.message}`);
    });
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return await this.getAsync(key);
  }

  async set(key, value, duration) {
    await this.setexAsync(key, duration, value);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
