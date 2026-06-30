import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError({
      res,
      statusCode: err.statusCode,
      code: err.name,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return sendError({
      res,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: err.issues,
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  // Send generic response for unhandled errors
  return sendError({
    res,
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    details: env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
