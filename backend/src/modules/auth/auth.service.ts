import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { supabase } from '../../database/supabase';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { RegisterInput, LoginInput } from './auth.schema';

export const authService = {
  async register(data: RegisterInput) {
    const { name, email, password } = data;

    // 1. Check if user exists
    const { data: existingUser } = await supabase
      .from('Users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new BadRequestError('Email is already registered');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user
    const { data: newUser, error } = await supabase
      .from('Users')
      .insert([{ name, email, password_hash: passwordHash }])
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return newUser;
  },

  async login(data: LoginInput) {
    const { email, password } = data;

    // 1. Find user
    const { data: user, error } = await supabase
      .from('Users')
      .select('id, name, email, password_hash, role')
      .eq('email', email)
      .single();

    if (!user || error) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 3. Generate token
    const token = this.generateToken(user.id);

    // Remove password_hash from response
    const { password_hash, ...userProfile } = user;

    return { user: userProfile, token };
  },

  generateToken(userId: string): string {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }
};
