"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const express_1 = require("express");
const errors_1 = require("../utils/errors");
const notFoundHandler = (req, res, next) => {
    next(new errors_1.NotFoundError(`Cannot find ${req.originalUrl} on this server`));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=notFound.middleware.js.map