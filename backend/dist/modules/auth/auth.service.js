"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const supabase_1 = require("../../database/supabase");
const errors_1 = require("../../utils/errors");
exports.authService = {
    async register(data) {
        const { name, email, password } = data;
        // 1. Check if user exists
        const { data: existingUser } = await supabase_1.supabase
            .from('Users')
            .select('id')
            .eq('email', email)
            .single();
        if (existingUser) {
            throw new errors_1.BadRequestError('Email is already registered');
        }
        // 2. Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash(password, salt);
        // 3. Create user
        const { data: newUser, error } = await supabase_1.supabase
            .from('Users')
            .insert([{ name, email, password_hash: passwordHash }])
            .select('id, name, email, role, created_at')
            .single();
        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }
        return newUser;
    },
    async login(data) {
        const { email, password } = data;
        // 1. Find user
        const { data: user, error } = await supabase_1.supabase
            .from('Users')
            .select('id, name, email, password_hash, role')
            .eq('email', email)
            .single();
        if (!user || error) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // 2. Verify password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // 3. Generate token
        const token = this.generateToken(user.id);
        // Remove password_hash from response
        const { password_hash, ...userProfile } = user;
        return { user: userProfile, token };
    },
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
    }
};
