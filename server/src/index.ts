import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🔄 [1/3] Initializing Express app...');
const app = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
console.log('   PORT env:', process.env.PORT);
console.log('   PORT parsed:', PORT);
console.log('   HOST:', HOST);

console.log('🔄 [2/3] Setting up CORS middleware...');

// Middleware - Custom CORS with function to handle dynamic Vercel previews
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://widymotretstudio.vercel.app',
    'https://widymotretstudio-git-be-fix-dimazs-projects.vercel.app',
];

const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || allowedOrigins.includes(origin) || origin?.includes('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

console.log('🔄 [3/3] Registering endpoints...');

// Health check
app.get('/', (req, res) => {
    console.log('📍 GET / called');
    process.stderr.write('📍 GET / called\n');
    res.set('Content-Type', 'application/json');
    res.write('{"status":"ok","message":"Widymotret API is running"}');
    res.end();
});

app.get('/api/health', (req, res) => {
    console.log('📍 GET /api/health called');
    process.stderr.write('📍 GET /api/health called\n');
    res.set('Content-Type', 'application/json');
    res.write('{"status":"ok","message":"Widymotret API is running"}');
    res.end();
});

// Log ALL incoming requests
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    process.stderr.write(`📨 ${req.method} ${req.path}\n`);
    next();
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.path}`);
    res.status(404).json({ status: 'error', message: 'Not found' });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error('🚨 Error:', err?.message);
    res.status(500).json({ status: 'error', message: err?.message });
});

console.log('🔄 Starting server...');
console.log('   Calling app.listen on', HOST + ':' + PORT);

// Start server
const server = app.listen(PORT, HOST, () => {
    const msg = `✅ Server running on http://${HOST}:${PORT}`;
    console.log('+++++++++++++++++++++++++++++++++');
    console.log(msg);
    console.log(`📋 API Health: http://${HOST}:${PORT}/api/health`);
    console.log('+++++++++++++++++++++++++++++++++');
    process.stderr.write('+++++++++++++++++++++++++++++++++\n');
    process.stderr.write(msg + '\n');
    process.stderr.write(`📋 API Health: http://${HOST}:${PORT}/api/health\n`);
    process.stderr.write('+++++++++++++++++++++++++++++++++\n');
});

// Global error handlers
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Server event handlers
server.on('error', (err: any) => {
    console.error('🚨 Server error:', err);
});

server.on('clientError', (err: any) => {
    console.error('🚨 Client error:', err);
});

console.log('✅ All event handlers ready');

// Keepalive interval untuk memastikan process tetap running
setInterval(() => {
    // Log setiap 30 detik
    // console.log('🔄 Server still alive...', new Date().toISOString());
}, 30000);

console.log('+++++++++++++++++++++++++++++++++');
