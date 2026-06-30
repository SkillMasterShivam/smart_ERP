import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Create a single supabase client for interacting with your database
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// For admin/backend tasks bypassing RLS (if needed in specific services)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export const checkDatabaseConnection = async () => {
  try {
    // A simple query to check if the connection is alive
    const { data, error } = await supabase.from('Users').select('id').limit(1);
    
    // We expect an error if the table doesn't exist yet, but not a connection error
    if (error && error.code === 'PGRST116') {
      logger.info('Database connected successfully (tables not yet created)');
      return true;
    }
    
    if (error && error.code !== '42P01') { // 42P01 is relation does not exist
        // other error
    }

    logger.info('Database connected successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database', error);
    return false;
  }
};
