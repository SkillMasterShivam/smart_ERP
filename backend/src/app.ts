import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'express-async-errors'; // Must be imported early

import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';

// Routes
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import companyRoutes from './modules/company/company.routes';

const app: Application = express();

// Security Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Performance Middlewares
app.use(compression()); // Compress response bodies

// Parsing Middlewares
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(
    morgan('dev', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// API Routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/companies`, companyRoutes);

// Unhandled Routes (404)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
