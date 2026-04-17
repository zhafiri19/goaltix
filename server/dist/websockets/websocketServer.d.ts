export declare class WebSocketHandler {
    private wss;
    private clients;
    private pingInterval;
    constructor(server: any);
    private setupWebSocketServer;
    private sendTicketStocks;
    private handleMessage;
    private sendToClient;
    broadcastTicketUpdate(ticketId: number, newStock: number): void;
    broadcastTransaction(transaction: any): void;
    broadcastMatchUpdate(matchId: number, matchData: any): void;
    private startPingInterval;
    close(): void;
}
//# sourceMappingURL=websocketServer.d.ts.map