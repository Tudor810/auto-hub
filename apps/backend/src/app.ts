import express, { Application } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser';
import logger from 'morgan'
import cors from 'cors'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import connectDB from './config/db.js';

import routes from './routes/index.js';
import { initCronJobs } from './jobs/documentAlerts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app : Application = express();

connectDB()

app.use(cors(corsOptions))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use('/api', routes);

app.get('/ping', (req, res) => res.send('AutoHub Backend is Online! 🚗'));

const PORT = env.port || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AutoHub Server Live`);
  console.log(`Mode: ${env.nodeEnv}`);
  console.log(`Port: ${env.port}`);

  initCronJobs();
});

