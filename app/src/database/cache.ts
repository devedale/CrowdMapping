import Redis from 'ioredis';

const redisURL = process.env.REDIS_URL || 'localhost'; 
const redisPort = parseInt(process.env.REDIS_PORT || '6379'); 
const redisPassword = process.env.REDIS_PASSWORD; 

const client = new Redis({
  host: redisURL,
  port: redisPort,
  password: redisPassword
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

export const setInCache = (key: string, value: string): void => {
    client.set(key, value);    
};

export const getFromCache = (key: string): Promise<string | null> => {
    return client.get(key);
};

export const deleteFromCache = (key: string): void => {
    client.del(key);
};

// Configurarazione lru e limite di memoria
const configureEvictionPolicy = async () => {
    try {
        await client.config('SET', 'maxmemory', '512mb');
        await client.config('SET', 'maxmemory-policy', 'allkeys-lru');
        console.log('Redis eviction policy configured to allkeys-lru with maxmemory 512mb');
    } catch (err) {
        console.error('Failed to configure Redis eviction policy:', err);
    }
};

configureEvictionPolicy();
