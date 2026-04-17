import { query } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    is_active: boolean;
    created_at: Date;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
}

export class UserModel {
    static async create(userData: CreateUserData): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `;
        const result = await query(sql, [
            userData.name,
            userData.email,
            hashedPassword,
            userData.role || 'user'
        ]);
        
        const insertedId = (result as any).insertId;
        const user = await this.findById(insertedId);
        if (!user) {
            throw new Error('Failed to create user');
        }
        return user;
    }

    static async findById(id: number): Promise<User | null> {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const users = await query(sql, [id]) as User[];
        return users.length > 0 ? users[0] : null;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const users = await query(sql, [email]) as User[];
        return users.length > 0 ? users[0] : null;
    }

    static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async getAll(): Promise<User[]> {
        const sql = 'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC';
        return await query(sql) as User[];
    }

    static async updateStatus(id: number, isActive: boolean): Promise<boolean> {
        const sql = 'UPDATE users SET is_active = ? WHERE id = ?';
        const result = await query(sql, [isActive, id]);
        return (result as any).affectedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await query(sql, [id]);
        return (result as any).affectedRows > 0;
    }

    static async getStats(): Promise<{ totalUsers: number; activeUsers: number; newUsersThisMonth: number }> {
        const sql = `
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeUsers,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as newUsersThisMonth
            FROM users
        `;
        const result = await query(sql) as any[];
        return result[0];
    }
}
