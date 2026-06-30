"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const auth_schema_1 = require("./auth.schema");
const response_1 = require("../../utils/response");
const env_1 = require("../../config/env");
const setTokenCookie = (res, token) => {
    // Parse expiration (e.g., '1d' to milliseconds)
    // Simplified for MVP: assume 1 day if not specified precisely
    const days = parseInt(env_1.env.JWT_EXPIRES_IN.replace('d', '')) || 1;
    const cookieOptions = {
        expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res.cookie('jwt', token, cookieOptions);
};
const register = async (req, res) => {
    const data = auth_schema_1.registerSchema.parse(req.body);
    const user = await auth_service_1.authService.register(data);
    return (0, response_1.sendSuccess)({
        res,
        statusCode: 201,
        message: 'User registered successfully',
        data: user,
    });
};
exports.register = register;
const login = async (req, res) => {
    const data = auth_schema_1.loginSchema.parse(req.body);
    const { user, token } = await auth_service_1.authService.login(data);
    setTokenCookie(res, token);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Login successful',
        data: { user, token },
    });
};
exports.login = login;
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    return (0, response_1.sendSuccess)({
        res,
        message: 'Logout successful',
    });
};
exports.logout = logout;
const getMe = async (req, res) => {
    // User is attached by the protect middleware
    const user = req.user;
    return (0, response_1.sendSuccess)({
        res,
        message: 'User profile retrieved successfully',
        data: user,
    });
};
exports.getMe = getMe;
