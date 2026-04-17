import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import matchRoutes from './routes/matches';
import transactionRoutes from './routes/transactions';
import adminRoutes from './routes/admin';

// Import WebSocket handler
import { WebSocketHandler } from './websockets/websocketServer';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
}));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../../client')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GOALTIX API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/user/login.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/admin/dashboard.html'));
});

app.get('/matches', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/user/matches.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/user/checkout.html'));
});

app.get('/tickets', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/pages/user/tickets.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Initialize WebSocket server
const wsHandler = new WebSocketHandler(server);

// Start server
server.listen(PORT, () => {
    console.log(`
    _______  _______  _______  _______  _______  _______  _______  _______ 
    |       ||       ||       ||       ||       ||       ||       ||       |
    |  _____||  _____||  _____||  _____||  _____||  _____||  _____||  _____|
    | |_____ | |_____ | |_____ | |_____ | |_____ | |_____ | |_____ | |_____ 
    |_____  ||_____  ||_____  ||_____  ||_____  ||_____  ||_____  ||_____  |
     _____| | _____| | _____| | _____| | _____| | _____| | _____| | _____| |
    |_______||_______||_______||_______||_______||_______||_______||_______|
    
    GOALTIX World Cup 2026 Ticket Booking Platform
    
    Server running on port ${PORT}
    API: http://localhost:${PORT}/api
    WebSocket: ws://localhost:${PORT}/ws
    
    Environment: ${process.env.NODE_ENV || 'development'}
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    wsHandler.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    wsHandler.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;
