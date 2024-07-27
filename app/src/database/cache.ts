import Redis from 'ioredis';

class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

  private constructor() {
    const redisURL = process.env.REDIS_URL || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.client = new Redis({
      host: redisURL,
      port: redisPort,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.setInCache = this.setInCache.bind(this);
    this.getFromCache = this.getFromCache.bind(this);
    this.deleteFromCache = this.deleteFromCache.bind(this);

    this.configureEvictionPolicy();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public setInCache(key: string, value: string): void {
    this.client.set(key, value);
  }

  public async getFromCache(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting value from cache:', error);
      return null; // Return null or handle it as appropriate
    }
  }

  public deleteFromCache(key: string): void {
    this.client.del(key);
  }

  private async configureEvictionPolicy(): Promise<void> {
    try {
      await this.client.config('SET', 'maxmemory', '512mb');
      await this.client.config('SET', 'maxmemory-policy', 'allkeys-lru');
      console.log('Redis eviction policy configured to allkeys-lru with maxmemory 512mb');
    } catch (err) {
      console.error('Failed to configure Redis eviction policy:', err);
    }
  }
}

const redisClient = RedisClient.getInstance();
export default redisClient;
