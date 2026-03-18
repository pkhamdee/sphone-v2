import Redis from 'ioredis'
import { ICacheService } from '../../application/ports/ICacheService'

let redisClient: Redis | null = null

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })
    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })
  }
  return redisClient
}

export class RedisCacheService implements ICacheService {
  private readonly redis: Redis

  constructor() {
    this.redis = getRedisClient()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? (JSON.parse(value) as T) : null
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (err) {
      console.error('[Redis] set error:', err)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (err) {
      console.error('[Redis] delete error:', err)
    }
  }
}
