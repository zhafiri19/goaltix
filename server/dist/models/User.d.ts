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
export declare class UserModel {
    static create(userData: CreateUserData): Promise<User>;
    static findById(id: number): Promise<User | null>;
    static findByEmail(email: string): Promise<User | null>;
    static validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    static getAll(): Promise<User[]>;
    static updateStatus(id: number, isActive: boolean): Promise<boolean>;
    static delete(id: number): Promise<boolean>;
    static getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        newUsersThisMonth: number;
    }>;
}
//# sourceMappingURL=User.d.ts.map