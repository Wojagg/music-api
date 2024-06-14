export const config = {
  mongo: {
    user: process.env.MONGO_USER || 'mongo',
    password: process.env.MONGO_PASSWORD || 'mongoPass',
    host: process.env.DB_HOST || 'mongo',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 8081,
    db: process.env.MUSIC_DB_NAME || 'music_db',
  },
  redis: {
    user: process.env.REDIS_USER || 'redis',
    password: process.env.REDIS_PASSWORD || 'redisPass',
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  },
};
