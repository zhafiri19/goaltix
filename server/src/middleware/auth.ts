import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
            return;
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
        return;
    }
};

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ 
                success: false, 
                message: 'Access denied. Authentication required.' 
            });
            return;
        }

        if (req.user.role !== 'admin') {
            res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error during authorization.' 
        });
        return;
    }
};
