import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log('--- DB CONNECTION TEST ---');
console.log('Current directory:', process.cwd());
console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Attempting to query database...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('Success! Result:', result);
        
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
        
    } catch (error) {
        console.error('DATABASE CONNECTION FAILED:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
