"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserModel {
    static async create(userData) {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `;
        const result = await (0, database_1.query)(sql, [
            userData.name,
            userData.email,
            hashedPassword,
            userData.role || 'user'
        ]);
        const insertedId = result.insertId;
        const user = await this.findById(insertedId);
        if (!user) {
            throw new Error('Failed to create user');
        }
        return user;
    }
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const users = await (0, database_1.query)(sql, [id]);
        return users.length > 0 ? users[0] : null;
    }
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const users = await (0, database_1.query)(sql, [email]);
        return users.length > 0 ? users[0] : null;
    }
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
    }
    static async getAll() {
        const sql = 'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC';
        return await (0, database_1.query)(sql);
    }
    static async updateStatus(id, isActive) {
        const sql = 'UPDATE users SET is_active = ? WHERE id = ?';
        const result = await (0, database_1.query)(sql, [isActive, id]);
        return result.affectedRows > 0;
    }
    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await (0, database_1.query)(sql, [id]);
        return result.affectedRows > 0;
    }
    static async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeUsers,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as newUsersThisMonth
            FROM users
        `;
        const result = await (0, database_1.query)(sql);
        return result[0];
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map