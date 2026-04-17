"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const User_1 = require("../models/User");
const Match_1 = require("../models/Match");
const Stadium_1 = require("../models/Stadium");
const Transaction_1 = require("../models/Transaction");
class AdminController {
    static async getDashboard(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const [userStats, matchStats, transactionStats, stadiumStats] = await Promise.all([
                User_1.UserModel.getStats(),
                Match_1.MatchModel.getStats(),
                Transaction_1.TransactionModel.getStats(),
                Stadium_1.StadiumModel.getStats()
            ]);
            const recentTransactions = await Transaction_1.TransactionModel.getAll();
            const recent = recentTransactions.slice(0, 10);
            const upcomingMatches = await Match_1.MatchModel.getUpcoming();
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
        }
        catch (error) {
            console.error('Get dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async getAllUsers(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const users = await User_1.UserModel.getAll();
            res.json({
                success: true,
                data: users
            });
            return;
        }
        catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async updateUserStatus(req, res) {
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
            const updated = await User_1.UserModel.updateStatus(parseInt(id), is_active);
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
        }
        catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async deleteUser(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const { id } = req.params;
            if (parseInt(id) === req.user?.userId) {
                res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
                return;
            }
            const deleted = await User_1.UserModel.delete(parseInt(id));
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
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async getAllStadiums(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const stadiums = await Stadium_1.StadiumModel.getAll();
            res.json({
                success: true,
                data: stadiums
            });
            return;
        }
        catch (error) {
            console.error('Get stadiums error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async createStadium(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const { name, city, country, capacity } = req.body;
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
            const stadium = await Stadium_1.StadiumModel.create({
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
        }
        catch (error) {
            console.error('Create stadium error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async updateStadium(req, res) {
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
            const updated = await Stadium_1.StadiumModel.update(parseInt(id), {
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
            const stadium = await Stadium_1.StadiumModel.findById(parseInt(id));
            res.json({
                success: true,
                message: 'Stadium updated successfully',
                data: stadium
            });
            return;
        }
        catch (error) {
            console.error('Update stadium error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
    static async deleteStadium(req, res) {
        try {
            if (req.user?.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            const { id } = req.params;
            const deleted = await Stadium_1.StadiumModel.delete(parseInt(id));
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
        }
        catch (error) {
            console.error('Delete stadium error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
            return;
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map