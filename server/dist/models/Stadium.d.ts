export interface Stadium {
    id: number;
    name: string;
    city: string;
    country: string;
    capacity: number;
    created_at: Date;
}
export interface CreateStadiumData {
    name: string;
    city: string;
    country: string;
    capacity: number;
}
export declare class StadiumModel {
    static create(stadiumData: CreateStadiumData): Promise<Stadium>;
    static findById(id: number): Promise<Stadium | null>;
    static getAll(): Promise<Stadium[]>;
    static update(id: number, stadiumData: Partial<CreateStadiumData>): Promise<boolean>;
    static delete(id: number): Promise<boolean>;
    static getStats(): Promise<{
        totalStadiums: number;
        totalCapacity: number;
        averageCapacity: number;
    }>;
}
//# sourceMappingURL=Stadium.d.ts.map