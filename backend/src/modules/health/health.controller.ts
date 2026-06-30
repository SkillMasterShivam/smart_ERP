import { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { checkDatabaseConnection } from '../../database/supabase';
import os from 'os';

export const getHealthStatus = (req: Request, res: Response) => {
  return sendSuccess({
    res,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
};

export const getServerInfo = (req: Request, res: Response) => {
  return sendSuccess({
    res,
    message: 'Server information retrieved successfully',
    data: {
      osType: os.type(),
      osRelease: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
    },
  });
};

export const getDbStatus = async (req: Request, res: Response) => {
  const isConnected = await checkDatabaseConnection();
  
  if (isConnected) {
    return sendSuccess({
      res,
      message: 'Database connection is healthy',
      data: { status: 'connected' }
    });
  } else {
    // Not using AppError here as we want to send a specific structured response
    // Or we could throw an AppError, but typically a health check might just return 503
    return res.status(503).json({
      success: false,
      error: {
        code: 'DB_CONNECTION_FAILED',
        message: 'Unable to connect to the database',
      }
    });
  }
};
