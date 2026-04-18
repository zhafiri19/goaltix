"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const database_1 = require("../config/database");
const database_2 = __importDefault(require("../config/database"));
class TransactionModel {
    static async create(transactionData) {
        const connection = await database_2.default.getConnection();
        try {
            await connection.beginTransaction();
            let total = 0;
            const ticketDetails = [];
            for (const item of transactionData.items) {
                const ticketSql = 'SELECT price FROM tickets WHERE id = ?';
                const [ticket] = await connection.execute(ticketSql, [item.ticket_id]);
                if (ticket.length === 0) {
                    throw new Error(`Ticket with id ${item.ticket_id} not found`);
                }
                total += ticket[0].price * item.quantity;
                ticketDetails.push({ ...item, price: ticket[0].price });
            }
            const transactionSql = `
                INSERT INTO transactions (user_id, total, status, payment_method)
                VALUES (?, ?, 'pending', ?)
            `;
            const [transactionResult] = await connection.execute(transactionSql, [transactionData.user_id, total, transactionData.payment_method || null]);
            const transactionId = transactionResult.insertId;
            for (const item of ticketDetails) {
                const updateStockSql = `
                    UPDATE tickets SET stock = stock - ? 
                    WHERE id = ? AND stock >= ?
                `;
                await connection.execute(updateStockSql, [item.quantity, item.ticket_id, item.quantity]);
                const itemSql = `
                    INSERT INTO transaction_items (transaction_id, ticket_id, quantity, price)
                    VALUES (?, ?, ?, ?)
                `;
                await connection.execute(itemSql, [transactionId, item.ticket_id, item.quantity, item.price]);
            }
            await connection.commit();
            const transaction = await this.findById(transactionId);
            if (!transaction) {
                throw new Error('Transaction created but not found');
            }
            return transaction;
        }
        catch (error) {
            await connection.rollback();
            throw new Error(`Failed to create transaction: ${error}`);
        }
        finally {
            connection.release();
        }
    }
    static async findById(id) {
        const sql = `
            SELECT t.*, u.name, u.email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        `;
        const transactions = await (0, database_1.query)(sql, [id]);
        if (transactions.length === 0)
            return null;
        const transaction = transactions[0];
        const items = await this.getItemsByTransaction(id);
        return {
            id: transaction.id,
            user_id: transaction.user_id,
            total: transaction.total,
            status: transaction.status,
            payment_method: transaction.payment_method,
            created_at: transaction.created_at,
            updated_at: transaction.updated_at,
            user: transaction.name ? {
                id: transaction.user_id,
                name: transaction.name,
                email: transaction.email
            } : undefined,
            items
        };
    }
    static async findByUserId(userId) {
        const sql = `
            SELECT t.*, u.name, u.email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC
        `;
        const transactions = await (0, database_1.query)(sql, [userId]);
        const result = [];
        for (const trans of transactions) {
            const items = await this.getItemsByTransaction(trans.id);
            result.push({
                id: trans.id,
                user_id: trans.user_id,
                total: trans.total,
                status: trans.status,
                payment_method: trans.payment_method,
                created_at: trans.created_at,
                updated_at: trans.updated_at,
                user: trans.name ? {
                    id: trans.user_id,
                    name: trans.name,
                    email: trans.email
                } : undefined,
                items
            });
        }
        return result;
    }
    static async getAll() {
        const sql = `
            SELECT t.*, u.name, u.email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `;
        const transactions = await (0, database_1.query)(sql);
        const result = [];
        for (const trans of transactions) {
            const items = await this.getItemsByTransaction(trans.id);
            result.push({
                id: trans.id,
                user_id: trans.user_id,
                total: trans.total,
                status: trans.status,
                payment_method: trans.payment_method,
                created_at: trans.created_at,
                updated_at: trans.updated_at,
                user: trans.name ? {
                    id: trans.user_id,
                    name: trans.name,
                    email: trans.email
                } : undefined,
                items
            });
        }
        return result;
    }
    static async getItemsByTransaction(transactionId) {
        const sql = `
            SELECT ti.*, t.category, t.match_id,
                   m.home_team_code, m.away_team_code,
                   s.name as stadium_name, s.city
            FROM transaction_items ti
            LEFT JOIN tickets t ON ti.ticket_id = t.id
            LEFT JOIN matches m ON t.match_id = m.id
            LEFT JOIN stadiums s ON m.stadium_id = s.id
            WHERE ti.transaction_id = ?
        `;
        const items = await (0, database_1.query)(sql, [transactionId]);
        return items.map(item => ({
            id: item.id,
            transaction_id: item.transaction_id,
            ticket_id: item.ticket_id,
            quantity: item.quantity,
            price: item.price,
            created_at: item.created_at,
            ticket: item.category ? {
                id: item.ticket_id,
                category: item.category,
                match_id: item.match_id,
                match: item.home_team_code ? {
                    home_team_code: item.home_team_code,
                    away_team_code: item.away_team_code,
                    stadium: item.stadium_name ? {
                        name: item.stadium_name,
                        city: item.city
                    } : undefined
                } : undefined
            } : undefined
        }));
    }
    static async updateStatus(id, status) {
        const sql = 'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?';
        const result = await (0, database_1.query)(sql, [status, id]);
        return result.affectedRows > 0;
    }
    static async getStats() {
        const sql = `
            SELECT 
                COUNT(*) as totalTransactions,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTransactions,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTransactions,
                SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as totalRevenue
            FROM transactions
        `;
        const result = await (0, database_1.query)(sql);
        return result[0];
    }
}
exports.TransactionModel = TransactionModel;
//# sourceMappingURL=Transaction.js.map