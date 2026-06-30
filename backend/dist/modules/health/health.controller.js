"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbStatus = exports.getServerInfo = exports.getHealthStatus = void 0;
const response_1 = require("../../utils/response");
const supabase_1 = require("../../database/supabase");
const os_1 = __importDefault(require("os"));
const getHealthStatus = (req, res) => {
    return (0, response_1.sendSuccess)({
        res,
        message: 'Server is healthy',
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
        },
    });
};
exports.getHealthStatus = getHealthStatus;
const getServerInfo = (req, res) => {
    return (0, response_1.sendSuccess)({
        res,
        message: 'Server information retrieved successfully',
        data: {
            osType: os_1.default.type(),
            osRelease: os_1.default.release(),
            totalMemory: os_1.default.totalmem(),
            freeMemory: os_1.default.freemem(),
            cpus: os_1.default.cpus().length,
        },
    });
};
exports.getServerInfo = getServerInfo;
const getDbStatus = async (req, res) => {
    const isConnected = await (0, supabase_1.checkDatabaseConnection)();
    if (isConnected) {
        return (0, response_1.sendSuccess)({
            res,
            message: 'Database connection is healthy',
            data: { status: 'connected' }
        });
    }
    else {
        // Not using AppError here as we want to send a specific structured response
        // Or we could throw an AppError, but typically a health check might just return 503
        return res.status(503).json({
            success: false,
            error: {
                code: 'DB_CONNECTION_FAILED',
                message: 'Unable to connect to the database',
            }
        });
    }
};
exports.getDbStatus = getDbStatus;
