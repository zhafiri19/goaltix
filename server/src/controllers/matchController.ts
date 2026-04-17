import { Request, Response } from 'express';
import { MatchModel } from '../models/Match';
import { StadiumModel } from '../models/Stadium';

export class MatchController {
    static async getAllMatches(req: Request, res: Response) {
        try {
            const matches = await MatchModel.getAll();
            
            res.json({
                success: true,
                data: matches
            });
            return;
        } catch (error) {
            console.error('Get matches error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getUpcomingMatches(req: Request, res: Response) {
        try {
            const matches = await MatchModel.getUpcoming();
            
            res.json({
                success: true,
                data: matches
            });
            return;
        } catch (error) {
            console.error('Get upcoming matches error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getMatchById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const match = await MatchModel.findById(parseInt(id));
            if (!match) {
                res.status(404).json({
                    success: false,
                    message: 'Match not found'
                });
                return;
            }
            
            res.json({
                success: true,
                data: match
            });
            return;
        } catch (error) {
            console.error('Get match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getTicketsByMatch(req: Request, res: Response) {
        try {
            const { matchId } = req.params;
            
            const tickets = await MatchModel.getTicketsByMatch(parseInt(matchId));
            
            res.json({
                success: true,
                data: tickets
            });
            return;
        } catch (error) {
            console.error('Get tickets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async createMatch(req: Request, res: Response): Promise<void> {
        try {
            const { home_team_code, away_team_code, stadium_id, match_date } = req.body;

            // Validation
            if (!home_team_code || !away_team_code || !stadium_id || !match_date) {
                res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
                return;
            }

            // Validate team codes (ISO 3166-1 alpha-2)
            if (home_team_code.length !== 2 || away_team_code.length !== 2) {
                res.status(400).json({
                    success: false,
                    message: 'Team codes must be 2 characters (ISO country codes)'
                });
                return;
            }

            // Check if stadium exists
            const stadium = await StadiumModel.findById(parseInt(stadium_id));
            if (!stadium) {
                res.status(400).json({
                    success: false,
                    message: 'Stadium not found'
                });
                return;
            }

            // Create match
            const match = await MatchModel.create({
                home_team_code: home_team_code.toUpperCase(),
                away_team_code: away_team_code.toUpperCase(),
                stadium_id: parseInt(stadium_id),
                match_date: new Date(match_date)
            });

            res.status(201).json({
                success: true,
                message: 'Match created successfully',
                data: match
            });
            return;
        } catch (error) {
            console.error('Create match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async updateMatch(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validate team codes if provided
            if (updateData.home_team_code && updateData.home_team_code.length !== 2) {
                res.status(400).json({
                    success: false,
                    message: 'Home team code must be 2 characters'
                });
                return;
            }

            if (updateData.away_team_code && updateData.away_team_code.length !== 2) {
                res.status(400).json({
                    success: false,
                    message: 'Away team code must be 2 characters'
                });
                return;
            }

            // Check if stadium exists if provided
            if (updateData.stadium_id) {
                const stadium = await StadiumModel.findById(parseInt(updateData.stadium_id));
                if (!stadium) {
                    res.status(400).json({
                        success: false,
                        message: 'Stadium not found'
                    });
                }
            }

            // Update match
            const updated = await MatchModel.update(parseInt(id), {
                home_team_code: updateData.home_team_code?.toUpperCase(),
                away_team_code: updateData.away_team_code?.toUpperCase(),
                stadium_id: updateData.stadium_id ? parseInt(updateData.stadium_id) : undefined,
                match_date: updateData.match_date ? new Date(updateData.match_date) : undefined
            });

            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: 'Match not found'
                });
                return;
            }

            const match = await MatchModel.findById(parseInt(id));
            
            res.json({
                success: true,
                message: 'Match updated successfully',
                data: match
            });
            return;
        } catch (error) {
            console.error('Update match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async deleteMatch(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const deleted = await MatchModel.delete(parseInt(id));
            
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Match not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Match deleted successfully'
            });
            return;
        } catch (error) {
            console.error('Delete match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
