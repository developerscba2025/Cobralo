import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

export const prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal',
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

// Optional: Ensure connection is valid on startup
prisma.$connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch((err: any) => console.error('❌ Database connection failed:', err));
