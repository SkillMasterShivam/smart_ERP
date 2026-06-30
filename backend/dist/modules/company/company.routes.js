"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_controller_1 = require("./company.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All company routes require authentication
router.use(auth_middleware_1.protect);
router.post('/', company_controller_1.createCompany);
router.get('/', company_controller_1.getCompanies);
router.get('/:id', company_controller_1.getCompanyById);
router.put('/:id', company_controller_1.updateCompany);
router.delete('/:id', company_controller_1.deleteCompany);
exports.default = router;
