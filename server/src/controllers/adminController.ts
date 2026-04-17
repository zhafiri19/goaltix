import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { MatchModel } from '../models/Match';
import { StadiumModel } from '../models/Stadium';
import { TransactionModel } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
    static async getDashboard(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            // Get all stats in parallel
            const [userStats, matchStats, transactionStats, stadiumStats] = await Promise.all([
                UserModel.getStats(),
                MatchModel.getStats(),
                TransactionModel.getStats(),
                StadiumModel.getStats()
            ]);

            // Get recent transactions
            const recentTransactions = await TransactionModel.getAll();
            const recent = recentTransactions.slice(0, 10);

            // Get upcoming matches
            const upcomingMatches = await MatchModel.getUpcoming();
            const upcoming = upcomingMatches.slice(0, 5);

            res.json({
                success: true,
                data: {
                    stats: {
                        users: userStats,
                        matches: matchStats,
                        transactions: transactionStats,
                        stadiums: stadiumStats
                    },
                    recentTransactions: recent,
                    upcomingMatches: upcoming
                }
            });
            return;
        } catch (error) {
            console.error('Get dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const users = await UserModel.getAll();

            res.json({
                success: true,
                data: users
            });
            return;
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const { id } = req.params;
            const { is_active } = req.body;

            if (typeof is_active !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'is_active must be a boolean'
                });
            }

            const updated = await UserModel.updateStatus(parseInt(id), is_active);

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'User status updated successfully'
            });
            return;
        } catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const { id } = req.params;

            // Prevent admin from deleting themselves
            if (parseInt(id) === req.user?.userId) {
                res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
                return;
            }

            const deleted = await UserModel.delete(parseInt(id));

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
            return;
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async getAllStadiums(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const stadiums = await StadiumModel.getAll();

            res.json({
                success: true,
                data: stadiums
            });
            return;
        } catch (error) {
            console.error('Get stadiums error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async createStadium(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const { name, city, country, capacity } = req.body;

            // Validation
            if (!name || !city || !country || !capacity) {
                res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
                return;
            }

            if (capacity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Capacity must be greater than 0'
                });
                return;
            }

            const stadium = await StadiumModel.create({
                name,
                city,
                country,
                capacity: parseInt(capacity)
            });

            if (!stadium) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to create stadium'
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Stadium created successfully',
                data: stadium
            });
            return;
        } catch (error) {
            console.error('Create stadium error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async updateStadium(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
                return;
            }

            const { id } = req.params;
            const updateData = req.body;

            if (updateData.capacity && updateData.capacity <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Capacity must be greater than 0'
                });
                return;
            }

            const updated = await StadiumModel.update(parseInt(id), {
                name: updateData.name,
                city: updateData.city,
                country: updateData.country,
                capacity: updateData.capacity ? parseInt(updateData.capacity) : undefined
            });

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: 'Stadium not found'
                });
                return;
            }

            const stadium = await StadiumModel.findById(parseInt(id));

            res.json({
                success: true,
                message: 'Stadium updated successfully',
                data: stadium
            });
            return;
        } catch (error) {
            console.error('Update stadium error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }

    static async deleteStadium(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }

            const { id } = req.params;

            const deleted = await StadiumModel.delete(parseInt(id));

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Stadium not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Stadium deleted successfully'
            });
            return;
        } catch (error) {
            console.error('Delete stadium error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
}
