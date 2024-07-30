export const config = {
  mongo: {
    user: process.env.DB_USERNAME || 'mongoUser',
    password: process.env.DB_PASSWORD || 'mongoPass',
    host: process.env.DB_HOST || 'mongo',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 27017,
    database: process.env.DB_NAME || 'music-auth',
    authSource: process.env.AUTH_DB_NAME || 'admin',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
  },
  security: {
    passwordHash: process.env.PASS_HASH || 'hash',
  },
};
