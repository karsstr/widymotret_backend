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

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/portfolios', portfoliosRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Static files for uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Widymotret API is running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Widymotret API is running' });
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📋 API Health: http://${HOST}:${PORT}/api/health`);
});
