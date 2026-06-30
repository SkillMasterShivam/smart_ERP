"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCompany = void 0;
const errors_1 = require("../utils/errors");
const company_service_1 = require("../modules/company/company.service");
/**
 * Middleware to ensure a valid company ID is provided and belongs to the user.
 * This should be used for all ERP modules (ledgers, inventory, etc.)
 * AFTER the `protect` middleware.
 */
const requireCompany = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        throw new errors_1.UnauthorizedError('User not authenticated');
    }
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
        throw new errors_1.BadRequestError('x-company-id header is required');
    }
    try {
        // Verify ownership and existence
        const company = await company_service_1.companyService.getCompanyById(user.id, companyId);
        // Attach company to request for downstream controllers
        req.company = company;
        next();
    }
    catch (error) {
        // getCompanyById throws NotFoundError which maps to 404, 
        // but in context of middleware, we can treat it as Forbidden or bad request.
        throw new errors_1.ForbiddenError('Unauthorized to access this company or company does not exist');
    }
};
exports.requireCompany = requireCompany;
