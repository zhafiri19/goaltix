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
export declare class TransactionModel {
    static create(transactionData: CreateTransactionData): Promise<Transaction>;
    static findById(id: number): Promise<Transaction | null>;
    static findByUserId(userId: number): Promise<Transaction[]>;
    static getAll(): Promise<Transaction[]>;
    static getItemsByTransaction(transactionId: number): Promise<TransactionItem[]>;
    static updateStatus(id: number, status: 'pending' | 'completed' | 'cancelled'): Promise<boolean>;
    static getStats(): Promise<{
        totalTransactions: number;
        completedTransactions: number;
        pendingTransactions: number;
        totalRevenue: number;
    }>;
}
//# sourceMappingURL=Transaction.d.ts.map