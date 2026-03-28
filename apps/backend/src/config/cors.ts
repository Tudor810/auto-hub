import {env} from './env.js'
import { CorsOptions } from 'cors';
export const corsOptions : CorsOptions = {
  origin: env.nodeEnv === 'development' ? ['http://192.168.0.110:8081', 'http://localhost:8081'] : ['https://autohub.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};