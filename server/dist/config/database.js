"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.transaction = transaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'goaltix',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = promise_1.default.createPool(config);
exports.default = pool;
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function transaction(queries) {
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
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
//# sourceMappingURL=database.js.map