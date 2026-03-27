import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('🔄 [prisma.ts] Creating PrismaClient instance...');
console.log('   DATABASE_URL exists:', !!process.env.DATABASE_URL);

const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'stdout' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
    ],
});

console.log('🔄 [prisma.ts] PrismaClient instance created, attempting connection...');

// Handle connection - with explicit logging
(async () => {
    try {
        console.log('⏳ [prisma.ts] Calling prisma.$connect()...');
        await prisma.$connect();
        console.log('✅ [prisma.ts] Database connected successfully');
        process.stderr.write('✅ [prisma.ts] Database connected successfully\n');
    } catch (err: any) {
        console.error('❌ [prisma.ts] Database connection error:', err.message);
        console.error('   Error code:', err.code);
        console.error('   Make sure DATABASE_URL is set and valid');
        console.error('   DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
        process.stderr.write('❌ [prisma.ts] Database connection error: ' + err.message + '\n');
    }
})();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 [prisma.ts] SIGTERM received, closing database connection...');
    try {
        await prisma.$disconnect();
        console.log('✅ [prisma.ts] Database disconnected');
    } catch (err) {
        console.error('❌ [prisma.ts] Error disconnecting:', err);
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 [prisma.ts] SIGINT received, closing database connection...');
    try {
        await prisma.$disconnect();
        console.log('✅ [prisma.ts] Database disconnected');
    } catch (err) {
        console.error('❌ [prisma.ts] Error disconnecting:', err);
    }
    process.exit(0);
});

export default prisma;
