import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { query } from '../config/database';
import url from 'url';

interface Client {
    ws: WebSocket;
    userId?: number;
    role?: string;
    lastPing: number;
}

export class WebSocketHandler {
    private wss: WebSocketServer;
    private clients: Map<WebSocket, Client> = new Map();
    private pingInterval: NodeJS.Timeout | null = null;

    constructor(server: any) {
        this.wss = new WebSocketServer({ 
            server,
            path: '/ws'
        });

        this.setupWebSocketServer();
        this.startPingInterval();
    }

    private setupWebSocketServer() {
        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            const client: Client = {
                ws,
                lastPing: Date.now()
            };

            // Parse URL for token
            const parsedUrl = url.parse(req.url || '', true);
            const token = parsedUrl.query.token as string;

            if (token) {
                try {
                    // Verify JWT token (simplified - in production use proper verification)
                    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                    client.userId = payload.userId;
                    client.role = payload.role;
                } catch (error) {
                    console.log('Invalid WebSocket token');
                }
            }

            this.clients.set(ws, client);
            console.log(`WebSocket client connected. Total clients: ${this.clients.size}`);

            // Send initial data
            this.sendToClient(ws, {
                type: 'connected',
                message: 'Connected to GOALTIX real-time updates',
                timestamp: new Date().toISOString()
            });

            // Send current ticket stocks
            this.sendTicketStocks(ws);

            ws.on('message', (data: Buffer) => {
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

    private async sendTicketStocks(ws: WebSocket) {
        try {
            const sql = `
                SELECT t.id, t.stock, t.match_id, t.category,
                       m.home_team_code, m.away_team_code
                FROM tickets t
                JOIN matches m ON t.match_id = m.id
                WHERE m.status = 'upcoming'
                ORDER BY t.match_id, t.category
            `;
            const tickets = await query(sql) as any[];

            this.sendToClient(ws, {
                type: 'ticket_stocks',
                data: tickets,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error sending ticket stocks:', error);
        }
    }

    private handleMessage(ws: WebSocket, message: string) {
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
                    // Handle match-specific subscriptions
                    this.sendToClient(ws, {
                        type: 'subscribed',
                        matchId: data.matchId,
                        timestamp: new Date().toISOString()
                    });
                    break;
                default:
                    console.log('Unknown WebSocket message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    private sendToClient(ws: WebSocket, data: any) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    // Public methods for broadcasting
    public broadcastTicketUpdate(ticketId: number, newStock: number) {
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

    public broadcastTransaction(transaction: any) {
        const message = {
            type: 'new_transaction',
            data: {
                ...transaction,
                timestamp: new Date().toISOString()
            }
        };

        // Send to all admin clients
        this.clients.forEach((client) => {
            if (client.role === 'admin') {
                this.sendToClient(client.ws, message);
            }
        });

        // Send to the specific user
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

    public broadcastMatchUpdate(matchId: number, matchData: any) {
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

    private startPingInterval() {
        this.pingInterval = setInterval(() => {
            const now = Date.now();
            this.clients.forEach((client, ws) => {
                // Remove clients that haven't responded in 30 seconds
                if (now - client.lastPing > 30000) {
                    ws.terminate();
                    this.clients.delete(ws);
                } else {
                    // Send ping
                    this.sendToClient(ws, { type: 'ping', timestamp: new Date().toISOString() });
                }
            });
        }, 10000); // Ping every 10 seconds
    }

    public close() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        this.clients.forEach((client) => {
            client.ws.close();
        });
        this.wss.close();
    }
}
