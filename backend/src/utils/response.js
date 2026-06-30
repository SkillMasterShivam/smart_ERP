"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const express_1 = require("express");
const sendSuccess = ({ res, statusCode = 200, message = 'Operation successful', data, meta, }) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data: data || null,
        ...(meta && { meta }),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = ({ res, statusCode = 500, code = 'SERVER_ERROR', message, details, }) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    });
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map