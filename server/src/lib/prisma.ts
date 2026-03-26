import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

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
