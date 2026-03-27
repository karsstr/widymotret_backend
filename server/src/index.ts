import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🔄 [0/4] Loading environment variables...');
console.log('   DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('   DATABASE_URL value:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
console.log('   PORT env:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);

console.log('🔄 [1/4] Importing Prisma client...');
import prisma from './lib/prisma';
console.log('✅ Prisma imported (initialization may still be pending)');

console.log('🔄 [2/4] Initializing Express app...');
const app = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
console.log('   PORT parsed:', PORT);
console.log('   HOST:', HOST);

console.log('🔄 [3/4] Setting up CORS middleware...');

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

// Serve uploaded files
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

console.log('🔄 [4/4] Registering endpoints...');

// Health check - must be before general request logging
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

// Import and register route handlers
console.log('🔄 [4a/4] Importing route modules...');
try {
    const authRoutes = require('./routes/auth').default;
    const contentRoutes = require('./routes/content').default;
    const packageRoutes = require('./routes/packages').default;
    const portfolioRoutes = require('./routes/portfolios').default;
    const uploadRoutes = require('./routes/upload').default;
    
    console.log('✅ Route modules imported');
    
    // Register routes
    console.log('🔄 [4b/4] Mounting route handlers...');
    app.use('/api/auth', authRoutes);
    app.use('/api/content', contentRoutes);
    app.use('/api/packages', packageRoutes);
    app.use('/api/portfolios', portfolioRoutes);
    app.use('/api/upload', uploadRoutes);
    
    console.log('✅ Route handlers mounted:');
    console.log('   GET /');
    console.log('   GET /api/health');
    console.log('   POST /api/auth/login');
    console.log('   POST /api/auth/register');
    console.log('   GET /api/auth/me (protected)');
    console.log('   GET /api/content');
    console.log('   GET /api/packages');
    console.log('   GET /api/portfolios');
    console.log('   POST /api/upload');
} catch (err: any) {
    console.error('❌ Error importing routes:', err?.message);
    console.error('   Full error:', err);
    process.stderr.write('❌ Error importing routes: ' + (err?.message || String(err)) + '\n');
    // Don't exit, continue with just health check
}

// Log ALL incoming requests (after route handlers so route logs appear first)
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

console.log('🔄 [5/6] Starting server initialization...');

// Async initialization function with Prisma connection check
async function startServer() {
    console.log('⏳ Waiting for Prisma database connection...');
    
    // Set a timeout for Prisma connection (30 seconds)
    const prismaTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Prisma connection timeout after 30 seconds')), 30000)
    );
    
    try {
        // Race between actual connection and timeout
        await Promise.race([
            prisma.$connect(),
            prismaTimeout
        ]);
        console.log('✅ Prisma database connection established');
    } catch (error: any) {
        console.error('❌ Failed to connect to database:', error?.message);
        console.error('   DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
        // Don't exit, still try to start server so we can see logs
        console.log('⚠️  Continuing without database for now...');
    }

    console.log('🔄 [6/6] Starting Express server...');
    console.log('   Calling app.listen on', HOST + ':' + PORT);

    // Start server
    const server = app.listen(PORT, HOST, () => {
        const msg = `✅ Server running on http://${HOST}:${PORT}`;
        console.log('═══════════════════════════════════');
        console.log(msg);
        console.log(`📋 API Health: http://${HOST}:${PORT}/api/health`);
        console.log('═══════════════════════════════════');
        process.stderr.write('═══════════════════════════════════\n');
        process.stderr.write(msg + '\n');
        process.stderr.write(`📋 API Health: http://${HOST}:${PORT}/api/health\n`);
        process.stderr.write('═══════════════════════════════════\n');
    });

    // Global error handlers
    process.on('unhandledRejection', (reason) => {
        console.error('❌ Unhandled Rejection:', reason);
        process.stderr.write('❌ Unhandled Rejection: ' + String(reason) + '\n');
    });

    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.stderr.write('❌ Uncaught Exception: ' + error.message + '\n');
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM received, shutting down gracefully...');
        process.stderr.write('🛑 SIGTERM received, shutting down gracefully...\n');
        server.close(async () => {
            console.log('✅ Server closed');
            try {
                await prisma.$disconnect();
                console.log('✅ Database disconnected');
            } catch (err) {
                console.error('❌ Error disconnecting database:', err);
            }
            process.exit(0);
        });
    });

    process.on('SIGINT', async () => {
        console.log('🛑 SIGINT received, shutting down gracefully...');
        process.stderr.write('🛑 SIGINT received, shutting down gracefully...\n');
        server.close(async () => {
            console.log('✅ Server closed');
            try {
                await prisma.$disconnect();
                console.log('✅ Database disconnected');
            } catch (err) {
                console.error('❌ Error disconnecting database:', err);
            }
            process.exit(0);
        });
    });

    // Server event handlers
    server.on('error', (err: any) => {
        console.error('🚨 Server error:', err);
        process.stderr.write('🚨 Server error: ' + (err?.message || String(err)) + '\n');
    });

    server.on('clientError', (err: any) => {
        console.error('🚨 Client error:', err);
        process.stderr.write('🚨 Client error: ' + (err?.message || String(err)) + '\n');
    });

    console.log('✅ All event handlers ready');
    
    // Keepalive interval untuk memastikan process tetap running
    setInterval(() => {
        // Optionally log periodically
        const timestamp = new Date().toISOString();
        console.log('🟢 Server still alive:', timestamp);
    }, 30000);
}

// Start the server
console.log('⏳ Triggering async initialization...');
startServer().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.stderr.write('❌ Failed to start server: ' + (err?.message || String(err)) + '\n');
    process.exit(1);
});

console.log('═══════════════════════════════════');
