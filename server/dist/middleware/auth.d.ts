import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../config/jwt';
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const adminMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map