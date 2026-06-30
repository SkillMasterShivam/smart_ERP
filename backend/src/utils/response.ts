import { Response } from 'express';

interface SuccessResponseArgs<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: any;
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message = 'Operation successful',
  data,
  meta,
}: SuccessResponseArgs<T>) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data || null,
    ...(meta && { meta }),
  });
};

interface ErrorResponseArgs {
  res: Response;
  statusCode?: number;
  code?: string;
  message: string;
  details?: any;
}

export const sendError = ({
  res,
  statusCode = 500,
  code = 'SERVER_ERROR',
  message,
  details,
}: ErrorResponseArgs) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
};
