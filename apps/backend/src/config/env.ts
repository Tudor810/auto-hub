import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    nodeEnv : string;
    port: number;
    mongoUri: string;
    jwtToken: string;
    googleWebClientId: string;
    emailUser: string;
    emailAppPassword: string;
}

export const env : EnvConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtToken: process.env.JWT_TOKEN || 'super_secret_jwt_token_for_autohub',
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
  emailUser: process.env.EMAIL_USER || '',
  emailAppPassword: process.env.EMAIL_APP_PASSWORD || ''
};

// Safety check: Ensure essential variables exist
if (!env.mongoUri) {
  throw new Error("❌ MONGO_URI is missing from .env file");
}