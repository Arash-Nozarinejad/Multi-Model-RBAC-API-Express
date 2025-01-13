import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env')});

// Type definition for our configuration
interface Config {
    node_env: string;
    port: number;
    postgres: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };
    mongodb: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    }
}

// Configuration object
const config: Config = {
    node_env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || 'rbac_db',
    },
    mongodb: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_logs',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRATION || '24h',
    },
    rateLimit: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // default 15 minutes
      max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    },
  };

  // Function to validate required environment variables
  const validateConfig = () => {
    const requredEnvVars = [
        'POSTGRES_PASSWORD',
        'JWT_SECRET'
    ];

    for (const envVar of requredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
  };

// Validate on import
validateConfig();

export default config;