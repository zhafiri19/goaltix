"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const Transaction_1 = require("../models/Transaction");
class TransactionController {
    static async createTransaction(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const { items, payment_method } = req.body;
            if (!items || !Array.isArray(items) || items.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Items array is required'
                });
                return;
            }
            for (const item of items) {
                if (!item.ticket_id || !item.quantity || item.quantity <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Each item must have ticket_id and positive quantity'
                    });
                    return;
                }
            }
            const transaction = await Transaction_1.TransactionModel.create({
                user_id: userId,
                items,
                payment_method
            });
            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction
            });
            return;
        }
        catch (error) {
            console.error('Create transaction error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }
    static async getUserTransactions(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const transactions = await Transaction_1.TransactionModel.findByUserId(userId);
            res.json({
                success: true,
                data: transactions
            });
            return;
        }
        catch (error) {
            console.error('Get user transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getTransactionById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const transaction = await Transaction_1.TransactionModel.findById(parseInt(id));
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }
            if (transaction.user_id !== userId && req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: transaction
            });
            return;
        }
        catch (error) {
            console.error('Get transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getAllTransactions(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const transactions = await Transaction_1.TransactionModel.getAll();
            res.json({
                success: true,
                data: transactions
            });
            return;
        }
        catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async updateTransactionStatus(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const { id } = req.params;
            const { status } = req.body;
            if (!status || !['pending', 'completed', 'cancelled'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be pending, completed, or cancelled'
                });
                return;
            }
            const updated = await Transaction_1.TransactionModel.updateStatus(parseInt(id), status);
            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }
            const transaction = await Transaction_1.TransactionModel.findById(parseInt(id));
            res.json({
                success: true,
                message: 'Transaction status updated successfully',
                data: transaction
            });
            return;
        }
        catch (error) {
            console.error('Update transaction status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
exports.TransactionController = TransactionController;
//# sourceMappingURL=transactionController.js.map