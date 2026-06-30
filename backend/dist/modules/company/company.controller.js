"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.getCompanyById = exports.getCompanies = exports.createCompany = void 0;
const company_schema_1 = require("./company.schema");
const company_service_1 = require("./company.service");
const response_1 = require("../../utils/response");
const createCompany = async (req, res) => {
    const data = company_schema_1.companySchema.parse(req.body);
    const userId = req.user.id;
    const company = await company_service_1.companyService.createCompany(userId, data);
    return (0, response_1.sendSuccess)({
        res,
        statusCode: 201,
        message: 'Company created successfully',
        data: company,
    });
};
exports.createCompany = createCompany;
const getCompanies = async (req, res) => {
    const userId = req.user.id;
    const companies = await company_service_1.companyService.getCompanies(userId);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Companies retrieved successfully',
        data: companies,
    });
};
exports.getCompanies = getCompanies;
const getCompanyById = async (req, res) => {
    const userId = req.user.id;
    const companyId = req.params.id;
    const company = await company_service_1.companyService.getCompanyById(userId, companyId);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Company retrieved successfully',
        data: company,
    });
};
exports.getCompanyById = getCompanyById;
const updateCompany = async (req, res) => {
    // Use partial schema for updates
    const data = company_schema_1.companySchema.partial().parse(req.body);
    const userId = req.user.id;
    const companyId = req.params.id;
    const company = await company_service_1.companyService.updateCompany(userId, companyId, data);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Company updated successfully',
        data: company,
    });
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res) => {
    const userId = req.user.id;
    const companyId = req.params.id;
    await company_service_1.companyService.deleteCompany(userId, companyId);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Company deleted successfully',
    });
};
exports.deleteCompany = deleteCompany;
