"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const Match_1 = require("../models/Match");
const Stadium_1 = require("../models/Stadium");
class MatchController {
    static async getAllMatches(req, res) {
        try {
            const matches = await Match_1.MatchModel.getAll();
            res.json({
                success: true,
                data: matches
            });
            return;
        }
        catch (error) {
            console.error('Get matches error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getUpcomingMatches(req, res) {
        try {
            const matches = await Match_1.MatchModel.getUpcoming();
            res.json({
                success: true,
                data: matches
            });
            return;
        }
        catch (error) {
            console.error('Get upcoming matches error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getMatchById(req, res) {
        try {
            const { id } = req.params;
            const match = await Match_1.MatchModel.findById(parseInt(id));
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
        }
        catch (error) {
            console.error('Get match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getTicketsByMatch(req, res) {
        try {
            const { matchId } = req.params;
            const tickets = await Match_1.MatchModel.getTicketsByMatch(parseInt(matchId));
            res.json({
                success: true,
                data: tickets
            });
            return;
        }
        catch (error) {
            console.error('Get tickets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async createMatch(req, res) {
        try {
            const { home_team_code, away_team_code, stadium_id, match_date } = req.body;
            if (!home_team_code || !away_team_code || !stadium_id || !match_date) {
                res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
                return;
            }
            if (home_team_code.length !== 2 || away_team_code.length !== 2) {
                res.status(400).json({
                    success: false,
                    message: 'Team codes must be 2 characters (ISO country codes)'
                });
                return;
            }
            const stadium = await Stadium_1.StadiumModel.findById(parseInt(stadium_id));
            if (!stadium) {
                res.status(400).json({
                    success: false,
                    message: 'Stadium not found'
                });
                return;
            }
            const match = await Match_1.MatchModel.create({
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
        }
        catch (error) {
            console.error('Create match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async updateMatch(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
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
            if (updateData.stadium_id) {
                const stadium = await Stadium_1.StadiumModel.findById(parseInt(updateData.stadium_id));
                if (!stadium) {
                    res.status(400).json({
                        success: false,
                        message: 'Stadium not found'
                    });
                }
            }
            const updated = await Match_1.MatchModel.update(parseInt(id), {
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
            const match = await Match_1.MatchModel.findById(parseInt(id));
            res.json({
                success: true,
                message: 'Match updated successfully',
                data: match
            });
            return;
        }
        catch (error) {
            console.error('Update match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async deleteMatch(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Match_1.MatchModel.delete(parseInt(id));
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
        }
        catch (error) {
            console.error('Delete match error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
exports.MatchController = MatchController;
//# sourceMappingURL=matchController.js.map