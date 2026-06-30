import { Request, Response } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { sendSuccess } from '../../utils/response';
import { env } from '../../config/env';

const setTokenCookie = (res: Response, token: string) => {
  // Parse expiration (e.g., '1d' to milliseconds)
  // Simplified for MVP: assume 1 day if not specified precisely
  const days = parseInt(env.JWT_EXPIRES_IN.replace('d', '')) || 1;
  const cookieOptions = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
  };

  res.cookie('jwt', token, cookieOptions);
};

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const user = await authService.register(data);

  return sendSuccess({
    res,
    statusCode: 201,
    message: 'User registered successfully',
    data: user,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const { user, token } = await authService.login(data);

  setTokenCookie(res, token);

  return sendSuccess({
    res,
    message: 'Login successful',
    data: { user, token },
  });
};

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
  });

  return sendSuccess({
    res,
    message: 'Logout successful',
  });
};

export const getMe = async (req: Request, res: Response) => {
  // User is attached by the protect middleware
  const user = (req as any).user;

  return sendSuccess({
    res,
    message: 'User profile retrieved successfully',
    data: user,
  });
};
