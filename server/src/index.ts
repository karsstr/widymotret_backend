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
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));
app.use(express.json());

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
