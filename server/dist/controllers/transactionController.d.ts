import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class TransactionController {
    static createTransaction(req: AuthRequest, res: Response): Promise<void>;
    static getUserTransactions(req: AuthRequest, res: Response): Promise<void>;
    static getTransactionById(req: AuthRequest, res: Response): Promise<void>;
    static getAllTransactions(req: AuthRequest, res: Response): Promise<void>;
    static updateTransactionStatus(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=transactionController.d.ts.map