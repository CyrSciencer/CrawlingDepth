import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define configuration schema
const configSchema = z.object({
  // Server
  port: z.string().default('3001'),
  nodeEnv: z.enum(['development', 'production']).default('development'),

  // MongoDB
  mongodbUri: z.string().min(1),
  
  // CORS
  corsOrigin: z.string().min(1),
});

// Create configuration object
const config = {
  port: process.env.PORT || '3001',
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.NODE_ENV === 'production' 
    ? process.env.MONGODB_URI_PROD 
    : process.env.MONGODB_URI,
  corsOrigin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN_PROD
    : process.env.CORS_ORIGIN,
};

// Validate configuration
const validatedConfig = configSchema.parse(config);

export default validatedConfig; 