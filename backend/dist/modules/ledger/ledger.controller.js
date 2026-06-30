"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLedger = exports.updateLedger = exports.getLedgerById = exports.getLedgers = exports.createLedger = void 0;
const ledger_service_1 = require("./ledger.service");
const ledger_schema_1 = require("./ledger.schema");
const response_1 = require("../../utils/response");
const createLedger = async (req, res) => {
    const data = ledger_schema_1.ledgerSchema.parse(req.body);
    const companyId = req.headers['x-company-id'];
    const userId = req.user.id;
    const ledger = await ledger_service_1.ledgerService.createLedger(companyId, userId, data);
    return (0, response_1.sendSuccess)({
        res,
        statusCode: 201,
        message: 'Ledger created successfully',
        data: ledger,
    });
};
exports.createLedger = createLedger;
const getLedgers = async (req, res) => {
    const companyId = req.headers['x-company-id'];
    const search = req.query.search;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
    const result = await ledger_service_1.ledgerService.getLedgers(companyId, { search, limit, offset });
    return (0, response_1.sendSuccess)({
        res,
        message: 'Ledgers retrieved successfully',
        data: result.data,
        meta: {
            total: result.total
        }
    });
};
exports.getLedgers = getLedgers;
const getLedgerById = async (req, res) => {
    const companyId = req.headers['x-company-id'];
    const ledgerId = req.params.id;
    const ledger = await ledger_service_1.ledgerService.getLedgerById(companyId, ledgerId);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Ledger retrieved successfully',
        data: ledger,
    });
};
exports.getLedgerById = getLedgerById;
const updateLedger = async (req, res) => {
    const data = ledger_schema_1.ledgerSchema.partial().parse(req.body);
    const companyId = req.headers['x-company-id'];
    const ledgerId = req.params.id;
    const ledger = await ledger_service_1.ledgerService.updateLedger(companyId, ledgerId, data);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Ledger updated successfully',
        data: ledger,
    });
};
exports.updateLedger = updateLedger;
const deleteLedger = async (req, res) => {
    const companyId = req.headers['x-company-id'];
    const ledgerId = req.params.id;
    await ledger_service_1.ledgerService.deleteLedger(companyId, ledgerId);
    return (0, response_1.sendSuccess)({
        res,
        message: 'Ledger archived successfully',
    });
};
exports.deleteLedger = deleteLedger;
