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
export declare class MatchModel {
    static create(matchData: CreateMatchData): Promise<Match>;
    static findById(id: number): Promise<Match | null>;
    static getAll(): Promise<Match[]>;
    static getUpcoming(): Promise<Match[]>;
    static getTicketsByMatch(matchId: number): Promise<Ticket[]>;
    static update(id: number, matchData: Partial<CreateMatchData>): Promise<boolean>;
    static delete(id: number): Promise<boolean>;
    static getStats(): Promise<{
        totalMatches: number;
        upcomingMatches: number;
        liveMatches: number;
        finishedMatches: number;
    }>;
}
//# sourceMappingURL=Match.d.ts.map