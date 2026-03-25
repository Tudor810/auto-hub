import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    nodeEnv : string;
    port: number;
    mongoUri: string;
    jwtSecret: string;

}

export const env : EnvConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_key_for_autohub',
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Safety check: Ensure essential variables exist
if (!env.mongoUri) {
  throw new Error("❌ MONGO_URI is missing from .env file");
}