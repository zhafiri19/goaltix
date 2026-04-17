import { query, transaction as executeTransaction } from '../config/database';

export interface Transaction {
    id: number;
    user_id: number;
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    payment_method?: string;
    created_at: Date;
    updated_at: Date;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    items?: TransactionItem[];
}

export interface TransactionItem {
    id: number;
    transaction_id: number;
    ticket_id: number;
    quantity: number;
    price: number;
    created_at: Date;
    ticket?: {
        id: number;
        category: string;
        match_id: number;
        match?: {
            home_team_code: string;
            away_team_code: string;
            stadium?: {
                name: string;
                city: string;
            };
        };
    };
}

export interface CreateTransactionData {
    user_id: number;
    items: {
        ticket_id: number;
        quantity: number;
    }[];
    payment_method?: string;
}

export class TransactionModel {
    static async create(transactionData: CreateTransactionData): Promise<Transaction> {
        const queries = [];
        
        // Calculate total and get ticket prices
        let total = 0;
        for (const item of transactionData.items) {
            const ticketSql = 'SELECT price FROM tickets WHERE id = ?';
            const ticket = await query(ticketSql, [item.ticket_id]) as any[];
            if (ticket.length === 0) {
                throw new Error(`Ticket with id ${item.ticket_id} not found`);
            }
            total += ticket[0].price * item.quantity;
        }
        
        // Create transaction
        const transactionSql = `
            INSERT INTO transactions (user_id, total, status, payment_method)
            VALUES (?, ?, 'pending', ?)
        `;
        queries.push({ sql: transactionSql, params: [transactionData.user_id, total, transactionData.payment_method] });
        
        // Create transaction items
        for (const item of transactionData.items) {
            const ticketSql = 'SELECT price FROM tickets WHERE id = ?';
            const ticket = await query(ticketSql, [item.ticket_id]) as any[];
            const price = ticket[0].price;
            
            const itemSql = `
                INSERT INTO transaction_items (transaction_id, ticket_id, quantity, price)
                VALUES (?, ?, ?, ?)
            `;
            queries.push({ sql: itemSql, params: [0, item.ticket_id, item.quantity, price] });
            
            // Update ticket stock
            const updateStockSql = `
                UPDATE tickets SET stock = stock - ? 
                WHERE id = ? AND stock >= ?
            `;
            queries.push({ sql: updateStockSql, params: [item.quantity, item.ticket_id, item.quantity] });
        }
        
        try {
            const results = await executeTransaction(queries);
            const transactionId = (results[0] as any).insertId;
            
            // Update transaction items with the actual transaction ID
            for (let i = 1; i <= transactionData.items.length; i++) {
                const updateItemSql = `
                    UPDATE transaction_items SET transaction_id = ? 
                    WHERE id = ?
                `;
                await query(updateItemSql, [transactionId, (results[i] as any).insertId]);
            }
            
            const transaction = await this.findById(transactionId);
            if (!transaction) {
                throw new Error('Failed to create transaction');
            }
            return transaction;
        } catch (error) {
            throw new Error('Failed to create transaction: ' + error);
        }
    }

    static async findById(id: number): Promise<Transaction | null> {
        const sql = `
            SELECT t.*, u.name, u.email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        `;
        const transactions = await query(sql, [id]) as any[];
        
        if (transactions.length === 0) return null;
        
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

    static async findByUserId(userId: number): Promise<Transaction[]> {
        const sql = `
            SELECT t.*, u.name, u.email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC
        `;
        const transactions = await query(sql, [userId]) as any[];
        
        const result: Transaction[] = [];
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

    static async getAll(): Promise<Transaction[]> {
        const sql = `
            SELECT t.*, u.name, u.email
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `;
        const transactions = await query(sql) as any[];
        
        const result: Transaction[] = [];
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

    static async getItemsByTransaction(transactionId: number): Promise<TransactionItem[]> {
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
        const items = await query(sql, [transactionId]) as any[];
        
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

    static async updateStatus(id: number, status: 'pending' | 'completed' | 'cancelled'): Promise<boolean> {
        const sql = 'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?';
        const result = await query(sql, [status, id]);
        return (result as any).affectedRows > 0;
    }

    static async getStats(): Promise<{
        totalTransactions: number;
        completedTransactions: number;
        pendingTransactions: number;
        totalRevenue: number;
    }> {
        const sql = `
            SELECT 
                COUNT(*) as totalTransactions,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTransactions,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingTransactions,
                SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as totalRevenue
            FROM transactions
        `;
        const result = await query(sql) as any[];
        return result[0];
    }
}
