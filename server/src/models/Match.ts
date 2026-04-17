import { query } from '../config/database';

export interface Match {
    id: number;
    home_team_code: string;
    away_team_code: string;
    stadium_id: number;
    match_date: Date;
    status: 'upcoming' | 'live' | 'finished';
    home_score: number;
    away_score: number;
    created_at: Date;
    stadium?: Stadium;
    tickets?: Ticket[];
}

export interface Stadium {
    id: number;
    name: string;
    city: string;
    country: string;
    capacity: number;
}

export interface Ticket {
    id: number;
    match_id: number;
    category: 'VIP' | 'Premium' | 'Regular' | 'Economy';
    price: number;
    stock: number;
    created_at: Date;
}

export interface CreateMatchData {
    home_team_code: string;
    away_team_code: string;
    stadium_id: number;
    match_date: Date;
}

export class MatchModel {
    static async create(matchData: CreateMatchData): Promise<Match> {
        const sql = `
            INSERT INTO matches (home_team_code, away_team_code, stadium_id, match_date)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [
            matchData.home_team_code,
            matchData.away_team_code,
            matchData.stadium_id,
            matchData.match_date
        ]);
        
        const insertedId = (result as any).insertId;
        const match = await this.findById(insertedId);
        if (!match) {
            throw new Error('Failed to create match');
        }
        return match;
    }

    static async findById(id: number): Promise<Match | null> {
        const sql = `
            SELECT m.*, s.name as stadium_name, s.city, s.country, s.capacity
            FROM matches m
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            WHERE m.id = ?
        `;
        const matches = await query(sql, [id]) as any[];
        
        if (matches.length === 0) return null;
        
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

    static async getAll(): Promise<Match[]> {
        const sql = `
            SELECT m.*, s.name as stadium_name, s.city, s.country
            FROM matches m
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            ORDER BY m.match_date ASC
        `;
        const matches = await query(sql) as any[];
        
        const result: Match[] = [];
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

    static async getUpcoming(): Promise<Match[]> {
        const sql = `
            SELECT m.*, s.name as stadium_name, s.city, s.country
            FROM matches m
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            WHERE m.status = 'upcoming' AND m.match_date > NOW()
            ORDER BY m.match_date ASC
            LIMIT 10
        `;
        const matches = await query(sql) as any[];
        
        const result: Match[] = [];
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

    static async getTicketsByMatch(matchId: number): Promise<Ticket[]> {
        const sql = 'SELECT * FROM tickets WHERE match_id = ? ORDER BY price DESC';
        return await query(sql, [matchId]) as Ticket[];
    }

    static async update(id: number, matchData: Partial<CreateMatchData>): Promise<boolean> {
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
        
        if (fields.length === 0) return false;
        
        values.push(id);
        const sql = `UPDATE matches SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return (result as any).affectedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const sql = 'DELETE FROM matches WHERE id = ?';
        const result = await query(sql, [id]);
        return (result as any).affectedRows > 0;
    }

    static async getStats(): Promise<{ totalMatches: number; upcomingMatches: number; liveMatches: number; finishedMatches: number }> {
        const sql = `
            SELECT 
                COUNT(*) as totalMatches,
                SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcomingMatches,
                SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as liveMatches,
                SUM(CASE WHEN status = 'finished' THEN 1 ELSE 0 END) as finishedMatches
            FROM matches
        `;
        const result = await query(sql) as any[];
        return result[0];
    }
}
