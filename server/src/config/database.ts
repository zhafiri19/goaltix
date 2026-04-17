import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    waitForConnections?: boolean;
    connectionLimit?: number;
    queueLimit?: number;
}

const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'goaltix',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(config);

export default pool;

// Helper function to execute queries
export async function query(sql: string, params?: any[]): Promise<any> {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function to execute transactions
export async function transaction(queries: { sql: string; params?: any[] }[]): Promise<any[]> {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        const results = [];
        
        for (const { sql, params } of queries) {
            const [result] = await connection.execute(sql, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
