"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("./health.controller");
const router = (0, express_1.Router)();
router.get('/', health_controller_1.getHealthStatus);
router.get('/info', health_controller_1.getServerInfo);
router.get('/db', health_controller_1.getDbStatus);
exports.default = router;
//# sourceMappingURL=health.routes.js.map