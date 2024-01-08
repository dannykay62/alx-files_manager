import redis from 'redis';
import { promisify } from 'util';
/**
 * This class is used to perform operation with Redis service
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();

    /* Promisify Redis methods */
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setexAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    /* handle error and connect events */
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
    this.client.on('connect', () => {
      console.log('Redis client connected');
    });
  }


  /**
   * checks if connection to Redis is successfull/Alive
   * @returns true when the connection to Redis is a success otherwise, otherwise false
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * takes a string key as argument and returns the Redis value
   * stored for this key
   * @param {string} key string key to search for in Redis
   * @returns {string} value of key
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }


  /**
   * takes a string key, a value and a duration in second as arguments to
   * store it in Redis (with an expiration set by the duration argument)
   * @param {string} key to be stored in Redis
   * @param {string} value to assign to the key
   * @param {number} duration TTL, expiration
   * @returns {undefined} No return
   */
  async set(key, value, duration) {
    await this.setexAsync(key, duration, value);
  }


  /**
   * takes a string key as argument and remove the value in Redis for this key
   * @param {string} key to delete
   * @returns {undefined} No return
   */
  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;