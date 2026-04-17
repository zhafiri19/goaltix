"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../config/jwt");
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
                return;
            }
            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
                return;
            }
            const existingUser = await User_1.UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
                return;
            }
            const user = await User_1.UserModel.create({ name, email, password });
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role
            });
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });
            return;
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }
            const user = await User_1.UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            if (!user.is_active) {
                res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
                return;
            }
            const isValidPassword = await User_1.UserModel.validatePassword(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role
            });
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });
            return;
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }
            const user = await User_1.UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            if (user.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
                return;
            }
            if (!user.is_active) {
                res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
                return;
            }
            const isValidPassword = await User_1.UserModel.validatePassword(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }
            const token = (0, jwt_1.generateToken)({
                userId: user.id,
                email: user.email,
                role: user.role
            });
            res.json({
                success: true,
                message: 'Admin login successful',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });
            return;
        }
        catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }
            const user = await User_1.UserModel.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
                    created_at: user.created_at
                }
            });
            return;
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map