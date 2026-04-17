import { Request, Response } from 'express';
export declare class MatchController {
    static getAllMatches(req: Request, res: Response): Promise<void>;
    static getUpcomingMatches(req: Request, res: Response): Promise<void>;
    static getMatchById(req: Request, res: Response): Promise<void>;
    static getTicketsByMatch(req: Request, res: Response): Promise<void>;
    static createMatch(req: Request, res: Response): Promise<void>;
    static updateMatch(req: Request, res: Response): Promise<void>;
    static deleteMatch(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=matchController.d.ts.map