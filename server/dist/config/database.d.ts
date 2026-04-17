import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export default pool;
export declare function query(sql: string, params?: any[]): Promise<any>;
export declare function transaction(queries: {
    sql: string;
    params?: any[];
}[]): Promise<any[]>;
//# sourceMappingURL=database.d.ts.map