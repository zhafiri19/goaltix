"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StadiumModel = void 0;
const database_1 = require("../config/database");
class StadiumModel {
    static async create(stadiumData) {
        const sql = `
            INSERT INTO stadiums (name, city, country, capacity)
            VALUES (?, ?, ?, ?)
        `;
        const result = await (0, database_1.query)(sql, [
            stadiumData.name,
            stadiumData.city,
            stadiumData.country,
            stadiumData.capacity
        ]);
        const insertedId = result.insertId;
        const stadium = await this.findById(insertedId);
        if (!stadium) {
            throw new Error('Failed to create stadium');
        }
        return stadium;
    }
    static async findById(id) {
        const sql = 'SELECT * FROM stadiums WHERE id = ?';
        const stadiums = await (0, database_1.query)(sql, [id]);
        return stadiums.length > 0 ? stadiums[0] : null;
    }
    static async getAll() {
        const sql = 'SELECT * FROM stadiums ORDER BY name ASC';
        return await (0, database_1.query)(sql);
    }
    static async update(id, stadiumData) {
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
        if (fields.length === 0)
            return false;
        values.push(id);
        const sql = `UPDATE stadiums SET ${fields.join(', ')} WHERE id = ?`;
        const result = await (0, database_1.query)(sql, values);
        return result.affectedRows > 0;
    }
    static async delete(id) {
        const sql = 'DELETE FROM stadiums WHERE id = ?';
        const result = await (0, database_1.query)(sql, [id]);
        return result.affectedRows > 0;
    }
    static async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as totalStadiums,
                SUM(capacity) as totalCapacity,
                AVG(capacity) as averageCapacity
            FROM stadiums
        `;
        const result = await (0, database_1.query)(sql);
        return result[0];
    }
}
exports.StadiumModel = StadiumModel;
//# sourceMappingURL=Stadium.js.map