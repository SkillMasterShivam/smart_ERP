"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("express-async-errors"); // Must be imported early
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middlewares/error.middleware");
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
// Routes
const health_routes_1 = __importDefault(require("./modules/health/health.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const company_routes_1 = __importDefault(require("./modules/company/company.routes"));
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)()); // Set security HTTP headers
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// Performance Middlewares
app.use((0, compression_1.default)()); // Compress response bodies
// Parsing Middlewares
app.use(express_1.default.json({ limit: '10kb' })); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies
app.use((0, cookie_parser_1.default)()); // Parse cookies
// Request Logging
if (env_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev', {
        stream: {
            write: (message) => logger_1.logger.info(message.trim()),
        },
    }));
}
// API Routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/health`, health_routes_1.default);
app.use(`${API_PREFIX}/auth`, auth_routes_1.default);
app.use(`${API_PREFIX}/companies`, company_routes_1.default);
// Unhandled Routes (404)
app.use(notFound_middleware_1.notFoundHandler);
// Global Error Handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
