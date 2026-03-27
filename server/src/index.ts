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
    res.set('Content-Type', 'application/json');
    res.write('{"status":"ok","message":"Widymotret API is running"}');
    res.end();
});

app.get('/api/health', (req, res) => {
    console.log('📍 GET /api/health called');
    res.set('Content-Type', 'application/json');
    res.write('{"status":"ok","message":"Widymotret API is running"}');
    res.end();
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error('🚨 Error:', err?.message);
    res.status(500).json({ status: 'error', message: err?.message });
});

console.log('🔄 Starting server...');
// Start server
app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📋 API Health: http://${HOST}:${PORT}/api/health`);
});

// Global error handlers
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
