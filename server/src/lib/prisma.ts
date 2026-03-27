import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// Debug: Log environment variables
console.log('📌 DEBUG: Environment Variables');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const prisma = new PrismaClient();

// Handle connection errors
prisma.$connect()
    .then(() => console.log('✅ Database connected'))
    .catch((err: Error) => {
        console.error('❌ Database connection error:', err.message);
        console.error('Make sure DATABASE_URL is set in environment variables');
    });

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connection...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connection...');
    await prisma.$disconnect();
    process.exit(0);
});

export default prisma;
