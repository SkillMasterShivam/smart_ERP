"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const startServer = () => {
    const PORT = env_1.env.PORT;
    const server = app_1.default.listen(PORT, () => {
        logger_1.logger.info(`🚀 Server running in ${env_1.env.NODE_ENV} mode on port ${PORT}`);
    });
    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
        logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            logger_1.logger.info('Closed out remaining connections.');
            process.exit(0);
        });
        // Force close after 10 seconds
        setTimeout(() => {
            logger_1.logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('unhandledRejection', (reason, promise) => {
        logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Optional: Let the application crash and restart (e.g. via PM2)
        // gracefulShutdown('unhandledRejection');
    });
    process.on('uncaughtException', (error) => {
        logger_1.logger.error('Uncaught Exception:', error);
        gracefulShutdown('uncaughtException');
    });
};
startServer();
//# sourceMappingURL=server.js.map