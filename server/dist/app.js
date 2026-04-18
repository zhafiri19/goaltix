"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const matches_1 = __importDefault(require("./routes/matches"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const admin_1 = __importDefault(require("./routes/admin"));
const websocketServer_1 = require("./websockets/websocketServer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../client')));
app.use('/api/auth', auth_1.default);
app.use('/api/matches', matches_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/admin', admin_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GOALTIX API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/user/login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/user/register.html'));
});
app.get('/admin/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/admin/login.html'));
});
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/admin/dashboard.html'));
});
app.get('/matches', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/user/matches.html'));
});
app.get('/checkout', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/user/checkout.html'));
});
app.get('/tickets', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../client/pages/user/tickets.html'));
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});
const wsHandler = new websocketServer_1.WebSocketHandler(server);
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
exports.default = app;
//# sourceMappingURL=app.js.map