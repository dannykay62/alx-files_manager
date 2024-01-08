import { error } from 'console';
import redis from 'redis';
import { promisify } from 'util';
/**
 * This class is used to perform operation with Redis service
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);
    this .client.on_connect('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });
    this.client.on('connect', () => {

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
    this.client.setex(key, duration, value);
  }


  /**
   * takes a string key as argument and remove the value in Redis for this key
   * @param {string} key to delete
   * @returns {undefined} No return
   */
  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;