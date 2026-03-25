import {env} from './env.js'
import { CorsOptions } from 'cors';
export const corsOptions : CorsOptions = {
  origin: env.nodeEnv === 'development' ? true : ['https://autohub.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};