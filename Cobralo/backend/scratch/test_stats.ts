
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQuery() {
    try {
        console.log("Testing raw query...");
        const userId = 1; // Assuming a user exists
        const year = 2026;
        
        const monthlyStats = await prisma.$queryRaw<Array<{ month: number; total: number; count: number }>>`
            SELECT 
                month,
                CAST(SUM(amount) AS DECIMAL(10,2)) as total,
                COUNT(*) as count
            FROM payment_history
            WHERE year = ${year} AND "ownerId" = ${userId}
            GROUP BY month
            ORDER BY month
        `;
        
        console.log("Result:", monthlyStats);
    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
