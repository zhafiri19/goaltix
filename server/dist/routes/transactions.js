"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionController_1 = require("../controllers/transactionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/checkout', auth_1.authMiddleware, transactionController_1.TransactionController.createTransaction);
router.get('/', auth_1.authMiddleware, transactionController_1.TransactionController.getUserTransactions);
router.get('/:id', auth_1.authMiddleware, transactionController_1.TransactionController.getTransactionById);
router.get('/admin/all', auth_1.authMiddleware, auth_1.adminMiddleware, transactionController_1.TransactionController.getAllTransactions);
router.patch('/:id/status', auth_1.authMiddleware, auth_1.adminMiddleware, transactionController_1.TransactionController.updateTransactionStatus);
exports.default = router;
//# sourceMappingURL=transactions.js.map