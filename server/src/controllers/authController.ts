import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../config/jwt';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;

            // Validation
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

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
                return;
            }

            // Create user
            const user = await UserModel.create({ name, email, password });
            
            // Generate token
            const token = generateToken({
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
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Check if user is active
            if (!user.is_active) {
                res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
                return;
            }

            // Validate password
            const isValidPassword = await UserModel.validatePassword(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Generate token
            const token = generateToken({
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
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Check if user is admin and active
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

            // Validate password
            const isValidPassword = await UserModel.validatePassword(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Generate token
            const token = generateToken({
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
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const user = await UserModel.findById(userId);
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
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
