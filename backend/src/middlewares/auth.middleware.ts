import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';
import { supabase } from '../database/supabase';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Check if token exists in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    throw new UnauthorizedError('You are not logged in! Please log in to get access.');
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    // 3. Check if user still exists
    const { data: user, error } = await supabase
      .from('Users')
      .select('id, name, email, role')
      .eq('id', decoded.id)
      .single();

    if (!user || error) {
      throw new UnauthorizedError('The user belonging to this token does no longer exist.');
    }

    // 4. Attach user to request
    (req as any).user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Your token has expired! Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token. Please log in again.');
    }
    throw error;
  }
};
