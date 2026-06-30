"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ledger_controller_1 = require("./ledger.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const tenant_middleware_1 = require("../../middlewares/tenant.middleware");
const router = (0, express_1.Router)();
// All ledger routes require authentication and a selected company
router.use(auth_middleware_1.protect);
router.use(tenant_middleware_1.requireCompany);
router.route('/')
    .post(ledger_controller_1.createLedger)
    .get(ledger_controller_1.getLedgers);
router.route('/:id')
    .get(ledger_controller_1.getLedgerById)
    .put(ledger_controller_1.updateLedger)
    .delete(ledger_controller_1.deleteLedger);
exports.default = router;
