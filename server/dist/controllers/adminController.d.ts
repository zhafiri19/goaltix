import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AdminController {
    static getDashboard(req: AuthRequest, res: Response): Promise<void>;
    static getAllUsers(req: AuthRequest, res: Response): Promise<void>;
    static updateUserStatus(req: AuthRequest, res: Response): Promise<void>;
    static deleteUser(req: AuthRequest, res: Response): Promise<void>;
    static getAllStadiums(req: AuthRequest, res: Response): Promise<void>;
    static createStadium(req: AuthRequest, res: Response): Promise<void>;
    static updateStadium(req: AuthRequest, res: Response): Promise<void>;
    static deleteStadium(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=adminController.d.ts.map