import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    nodeEnv : string;
    port: number;
    mongoUri: string;
    jwtToken: string;
}

export const env : EnvConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtToken: process.env.JWT_TOKEN || 'super_secret_jwt_token_for_autohub'
};

// Safety check: Ensure essential variables exist
if (!env.mongoUri) {
  throw new Error("❌ MONGO_URI is missing from .env file");
}