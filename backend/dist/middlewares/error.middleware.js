"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.AppError) {
        return (0, response_1.sendError)({
            res,
            statusCode: err.statusCode,
            code: err.name,
            message: err.message,
        });
    }
    if (err instanceof zod_1.ZodError) {
        return (0, response_1.sendError)({
            res,
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: err.issues,
        });
    }
    // Log unexpected errors
    logger_1.logger.error('Unexpected error:', err);
    // Send generic response for unhandled errors
    return (0, response_1.sendError)({
        res,
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: env_1.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        details: env_1.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
