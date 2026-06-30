"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
const supabase_1 = require("../database/supabase");
const protect = async (req, res, next) => {
    let token;
    // 1. Check if token exists in headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        throw new errors_1.UnauthorizedError('You are not logged in! Please log in to get access.');
    }
    try {
        // 2. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // 3. Check if user still exists
        const { data: user, error } = await supabase_1.supabase
            .from('Users')
            .select('id, name, email, role')
            .eq('id', decoded.id)
            .single();
        if (!user || error) {
            throw new errors_1.UnauthorizedError('The user belonging to this token does no longer exist.');
        }
        // 4. Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new errors_1.UnauthorizedError('Your token has expired! Please log in again.');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new errors_1.UnauthorizedError('Invalid token. Please log in again.');
        }
        throw error;
    }
};
exports.protect = protect;
