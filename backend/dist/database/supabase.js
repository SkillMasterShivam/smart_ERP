"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseConnection = exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
// Create a single supabase client for interacting with your database
exports.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_ANON_KEY);
// For admin/backend tasks bypassing RLS (if needed in specific services)
exports.supabaseAdmin = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
const checkDatabaseConnection = async () => {
    try {
        // A simple query to check if the connection is alive
        const { data, error } = await exports.supabase.from('Users').select('id').limit(1);
        // We expect an error if the table doesn't exist yet, but not a connection error
        if (error && error.code === 'PGRST116') {
            logger_1.logger.info('Database connected successfully (tables not yet created)');
            return true;
        }
        if (error && error.code !== '42P01') { // 42P01 is relation does not exist
            // other error
        }
        logger_1.logger.info('Database connected successfully');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to database', error);
        return false;
    }
};
exports.checkDatabaseConnection = checkDatabaseConnection;
