"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketHandler = void 0;
const ws_1 = require("ws");
const database_1 = require("../config/database");
const url_1 = __importDefault(require("url"));
class WebSocketHandler {
    constructor(server) {
        this.clients = new Map();
        this.pingInterval = null;
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws'
        });
        this.setupWebSocketServer();
        this.startPingInterval();
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            const client = {
                ws,
                lastPing: Date.now()
            };
            const parsedUrl = url_1.default.parse(req.url || '', true);
            const token = parsedUrl.query.token;
            if (token) {
                try {
                    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                    client.userId = payload.userId;
                    client.role = payload.role;
                }
                catch (error) {
                    console.log('Invalid WebSocket token');
                }
            }
            this.clients.set(ws, client);
            console.log(`WebSocket client connected. Total clients: ${this.clients.size}`);
            this.sendToClient(ws, {
                type: 'connected',
                message: 'Connected to GOALTIX real-time updates',
                timestamp: new Date().toISOString()
            });
            this.sendTicketStocks(ws);
            ws.on('message', (data) => {
                this.handleMessage(ws, data.toString());
            });
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log(`WebSocket client disconnected. Total clients: ${this.clients.size}`);
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }
    async sendTicketStocks(ws) {
        try {
            const sql = `
                SELECT t.id, t.stock, t.match_id, t.category,
                       m.home_team_code, m.away_team_code
                FROM tickets t
                JOIN matches m ON t.match_id = m.id
                WHERE m.status = 'upcoming'
                ORDER BY t.match_id, t.category
            `;
            const tickets = await (0, database_1.query)(sql);
            this.sendToClient(ws, {
                type: 'ticket_stocks',
                data: tickets,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error sending ticket stocks:', error);
        }
    }
    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            const client = this.clients.get(ws);
            switch (data.type) {
                case 'ping':
                    if (client) {
                        client.lastPing = Date.now();
                        this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
                    }
                    break;
                case 'subscribe_match':
                    this.sendToClient(ws, {
                        type: 'subscribed',
                        matchId: data.matchId,
                        timestamp: new Date().toISOString()
                    });
                    break;
                default:
                    console.log('Unknown WebSocket message type:', data.type);
            }
        }
        catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }
    sendToClient(ws, data) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    broadcastTicketUpdate(ticketId, newStock) {
        const message = {
            type: 'ticket_update',
            data: {
                ticketId,
                stock: newStock,
                timestamp: new Date().toISOString()
            }
        };
        this.clients.forEach((client) => {
            this.sendToClient(client.ws, message);
        });
    }
    broadcastTransaction(transaction) {
        const message = {
            type: 'new_transaction',
            data: {
                ...transaction,
                timestamp: new Date().toISOString()
            }
        };
        this.clients.forEach((client) => {
            if (client.role === 'admin') {
                this.sendToClient(client.ws, message);
            }
        });
        this.clients.forEach((client) => {
            if (client.userId === transaction.user_id) {
                this.sendToClient(client.ws, {
                    type: 'transaction_success',
                    data: transaction,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    broadcastMatchUpdate(matchId, matchData) {
        const message = {
            type: 'match_update',
            data: {
                matchId,
                ...matchData,
                timestamp: new Date().toISOString()
            }
        };
        this.clients.forEach((client) => {
            this.sendToClient(client.ws, message);
        });
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            const now = Date.now();
            this.clients.forEach((client, ws) => {
                if (now - client.lastPing > 30000) {
                    ws.terminate();
                    this.clients.delete(ws);
                }
                else {
                    this.sendToClient(ws, { type: 'ping', timestamp: new Date().toISOString() });
                }
            });
        }, 10000);
    }
    close() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        this.clients.forEach((client) => {
            client.ws.close();
        });
        this.wss.close();
    }
}
exports.WebSocketHandler = WebSocketHandler;
//# sourceMappingURL=websocketServer.js.map