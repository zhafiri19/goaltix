import { query } from '../config/database';

export interface Stadium {
    id: number;
    name: string;
    city: string;
    country: string;
    capacity: number;
    created_at: Date;
}

export interface CreateStadiumData {
    name: string;
    city: string;
    country: string;
    capacity: number;
}

export class StadiumModel {
    static async create(stadiumData: CreateStadiumData): Promise<Stadium> {
        const sql = `
            INSERT INTO stadiums (name, city, country, capacity)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [
            stadiumData.name,
            stadiumData.city,
            stadiumData.country,
            stadiumData.capacity
        ]);
        
        const insertedId = (result as any).insertId;
        const stadium = await this.findById(insertedId);
        if (!stadium) {
            throw new Error('Failed to create stadium');
        }
        return stadium;
    }

    static async findById(id: number): Promise<Stadium | null> {
        const sql = 'SELECT * FROM stadiums WHERE id = ?';
        const stadiums = await query(sql, [id]) as Stadium[];
        return stadiums.length > 0 ? stadiums[0] : null;
    }

    static async getAll(): Promise<Stadium[]> {
        const sql = 'SELECT * FROM stadiums ORDER BY name ASC';
        return await query(sql) as Stadium[];
    }

    static async update(id: number, stadiumData: Partial<CreateStadiumData>): Promise<boolean> {
        const fields = [];
        const values = [];
        
        if (stadiumData.name) {
            fields.push('name = ?');
            values.push(stadiumData.name);
        }
        if (stadiumData.city) {
            fields.push('city = ?');
            values.push(stadiumData.city);
        }
        if (stadiumData.country) {
            fields.push('country = ?');
            values.push(stadiumData.country);
        }
        if (stadiumData.capacity) {
            fields.push('capacity = ?');
            values.push(stadiumData.capacity);
        }
        
        if (fields.length === 0) return false;
        
        values.push(id);
        const sql = `UPDATE stadiums SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return (result as any).affectedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const sql = 'DELETE FROM stadiums WHERE id = ?';
        const result = await query(sql, [id]);
        return (result as any).affectedRows > 0;
    }

    static async getStats(): Promise<{ totalStadiums: number; totalCapacity: number; averageCapacity: number }> {
        const sql = `
            SELECT 
                COUNT(*) as totalStadiums,
                SUM(capacity) as totalCapacity,
                AVG(capacity) as averageCapacity
            FROM stadiums
        `;
        const result = await query(sql) as any[];
        return result[0];
    }
}
