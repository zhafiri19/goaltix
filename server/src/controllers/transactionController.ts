import { Request, Response } from 'express';
import { TransactionModel } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export class TransactionController {
    static async createTransaction(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const { items, payment_method } = req.body;

            // Validation
            if (!items || !Array.isArray(items) || items.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Items array is required'
                });
                return;
            }

            // Validate each item
            for (const item of items) {
                if (!item.ticket_id || !item.quantity || item.quantity <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Each item must have ticket_id and positive quantity'
                    });
                    return;
                }
            }

            // Create transaction
            const transaction = await TransactionModel.create({
                user_id: userId!,
                items,
                payment_method
            });

            res.status(201).json({
                success: true,
                message: 'Transaction created successfully',
                data: transaction
            });
            return;
        } catch (error) {
            console.error('Create transaction error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            });
        }
    }

    static async getUserTransactions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const transactions = await TransactionModel.findByUserId(userId!);

            res.json({
                success: true,
                data: transactions
            });
            return;
        } catch (error) {
            console.error('Get user transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getTransactionById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const transaction = await TransactionModel.findById(parseInt(id));
            
            if (!transaction) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }

            // Check if user owns the transaction or is admin
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
        } catch (error) {
            console.error('Get transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getAllTransactions(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const transactions = await TransactionModel.getAll();

            res.json({
                success: true,
                data: transactions
            });
            return;
        } catch (error) {
            console.error('Get all transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async updateTransactionStatus(req: AuthRequest, res: Response): Promise<void> {
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

            const updated = await TransactionModel.updateStatus(
                parseInt(id),
                status as 'pending' | 'completed' | 'cancelled'
            );

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }

            const transaction = await TransactionModel.findById(parseInt(id));

            res.json({
                success: true,
                message: 'Transaction status updated successfully',
                data: transaction
            });
            return;
        } catch (error) {
            console.error('Update transaction status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
