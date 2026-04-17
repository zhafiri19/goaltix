"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchModel = void 0;
const database_1 = require("../config/database");
class MatchModel {
    static async create(matchData) {
        const sql = `
            INSERT INTO matches (home_team_code, away_team_code, stadium_id, match_date)
            VALUES (?, ?, ?, ?)
        `;
        const result = await (0, database_1.query)(sql, [
            matchData.home_team_code,
            matchData.away_team_code,
            matchData.stadium_id,
            matchData.match_date
        ]);
        const insertedId = result.insertId;
        const match = await this.findById(insertedId);
        if (!match) {
            throw new Error('Failed to create match');
        }
        return match;
    }
    static async findById(id) {
        const sql = `
            SELECT m.*, s.name as stadium_name, s.city, s.country, s.capacity
            FROM matches m
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            WHERE m.id = ?
        `;
        const matches = await (0, database_1.query)(sql, [id]);
        if (matches.length === 0)
            return null;
        const match = matches[0];
        const tickets = await this.getTicketsByMatch(id);
        return {
            id: match.id,
            home_team_code: match.home_team_code,
            away_team_code: match.away_team_code,
            stadium_id: match.stadium_id,
            match_date: match.match_date,
            status: match.status,
            home_score: match.home_score,
            away_score: match.away_score,
            created_at: match.created_at,
            stadium: match.stadium_name ? {
                id: match.stadium_id,
                name: match.stadium_name,
                city: match.city,
                country: match.country,
                capacity: match.capacity
            } : undefined,
            tickets
        };
    }
    static async getAll() {
        const sql = `
            SELECT m.*, s.name as stadium_name, s.city, s.country
            FROM matches m
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            ORDER BY m.match_date ASC
        `;
        const matches = await (0, database_1.query)(sql);
        const result = [];
        for (const match of matches) {
            const tickets = await this.getTicketsByMatch(match.id);
            result.push({
                id: match.id,
                home_team_code: match.home_team_code,
                away_team_code: match.away_team_code,
                stadium_id: match.stadium_id,
                match_date: match.match_date,
                status: match.status,
                home_score: match.home_score,
                away_score: match.away_score,
                created_at: match.created_at,
                stadium: match.stadium_name ? {
                    id: match.stadium_id,
                    name: match.stadium_name,
                    city: match.city,
                    country: match.country,
                    capacity: 0
                } : undefined,
                tickets
            });
        }
        return result;
    }
    static async getUpcoming() {
        const sql = `
            SELECT m.*, s.name as stadium_name, s.city, s.country
            FROM matches m
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            WHERE m.status = 'upcoming' AND m.match_date > NOW()
            ORDER BY m.match_date ASC
            LIMIT 10
        `;
        const matches = await (0, database_1.query)(sql);
        const result = [];
        for (const match of matches) {
            const tickets = await this.getTicketsByMatch(match.id);
            result.push({
                id: match.id,
                home_team_code: match.home_team_code,
                away_team_code: match.away_team_code,
                stadium_id: match.stadium_id,
                match_date: match.match_date,
                status: match.status,
                home_score: match.home_score,
                away_score: match.away_score,
                created_at: match.created_at,
                stadium: match.stadium_name ? {
                    id: match.stadium_id,
                    name: match.stadium_name,
                    city: match.city,
                    country: match.country,
                    capacity: 0
                } : undefined,
                tickets
            });
        }
        return result;
    }
    static async getTicketsByMatch(matchId) {
        const sql = 'SELECT * FROM tickets WHERE match_id = ? ORDER BY price DESC';
        return await (0, database_1.query)(sql, [matchId]);
    }
    static async update(id, matchData) {
        const fields = [];
        const values = [];
        if (matchData.home_team_code) {
            fields.push('home_team_code = ?');
            values.push(matchData.home_team_code);
        }
        if (matchData.away_team_code) {
            fields.push('away_team_code = ?');
            values.push(matchData.away_team_code);
        }
        if (matchData.stadium_id) {
            fields.push('stadium_id = ?');
            values.push(matchData.stadium_id);
        }
        if (matchData.match_date) {
            fields.push('match_date = ?');
            values.push(matchData.match_date);
        }
        if (fields.length === 0)
            return false;
        values.push(id);
        const sql = `UPDATE matches SET ${fields.join(', ')} WHERE id = ?`;
        const result = await (0, database_1.query)(sql, values);
        return result.affectedRows > 0;
    }
    static async delete(id) {
        const sql = 'DELETE FROM matches WHERE id = ?';
        const result = await (0, database_1.query)(sql, [id]);
        return result.affectedRows > 0;
    }
    static async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as totalMatches,
                SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcomingMatches,
                SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as liveMatches,
                SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finishedMatches
            FROM matches
        `;
        const result = await (0, database_1.query)(sql);
        return result[0];
    }
}
exports.MatchModel = MatchModel;
//# sourceMappingURL=Match.js.map