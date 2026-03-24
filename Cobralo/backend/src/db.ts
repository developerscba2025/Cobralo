import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal',
    // Prisma doesn't have a direct "timeout" property in the constructor, 
    // but we can set it via datasource overrides if needed, 
    // or rely on the engine's default which is usually sufficient 
    // when combined with application-level timeouts in routes.
});

// Optional: Ensure connection is valid on startup
prisma.$connect()
    .then(() => console.log('✅ Database connected successfully'))
    .catch((err) => console.error('❌ Database connection failed:', err));
