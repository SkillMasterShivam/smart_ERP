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
import ledgerRoutes from './modules/ledger/ledger.routes';
import groupRoutes from './modules/group/group.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import purchaseRoutes from './modules/purchase/purchase.routes';
import salesRoutes from './modules/sales/sales.routes';

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
app.use(`${API_PREFIX}/ledgers`, ledgerRoutes);
app.use(`${API_PREFIX}/groups`, groupRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/sales`, salesRoutes);

// Unhandled Routes (404)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
