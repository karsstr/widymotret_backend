import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.ts';
import packagesRoutes from './routes/packages.ts';
import portfoliosRoutes from './routes/portfolios.ts';
import contentRoutes from './routes/content.ts';
import uploadRoutes from './routes/upload.ts';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🔄 [1/5] Initializing Express app...');
const app = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

console.log('🔄 [2/5] Setting up CORS middleware...');

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

// Global OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

console.log('🔄 [3/5] Mounting API routes...');
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/portfolios', portfoliosRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
console.log('🔄 [4/5] Setting up static files...');

// Static files for uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

console.log('🔄 [5/5] Registering health check endpoints...');
// Health check
app.get('/', (req, res) => {
    try {
        res.json({ status: 'ok', message: 'Widymotret API is running' });
    } catch (error) {
        console.error('❌ Error in / handler:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

app.get('/api/health', (req, res) => {
    try {
        console.log('📍 Health check requested');
        res.json({ status: 'ok', message: 'Widymotret API is running' });
    } catch (error) {
        console.error('❌ Error in /api/health handler:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// Error handling middleware (MUST be last)
app.use((err: any, req: any, res: any, next: any) => {
    console.error('🚨 Request Error:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack?.split('\n').slice(0, 3).join('\n'),
    });
    res.status(500).json({ status: 'error', message: err?.message || 'Internal Server Error' });
});

console.log('🔄 Calling app.listen()...');
// Start server
app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📋 API Health: http://${HOST}:${PORT}/api/health`);
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
