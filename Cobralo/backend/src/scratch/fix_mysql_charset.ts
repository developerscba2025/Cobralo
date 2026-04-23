
import { prisma } from '../db';

async function fixMySQLCharset() {
    try {
        console.log("Detecting database provider...");
        
        // This is a hacky way to check provider, but we can just try to run the command
        // if it's MySQL it works, if it's SQLite it will fail (which is fine).
        
        console.log("Attempting to set utf8mb4 for MySQL tables...");
        
        const tables = ['User', 'Student', 'ClassSchedule', 'Payment'];
        
        for (const table of tables) {
            try {
                // MySQL specific command
                await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
                console.log(`✅ Table ${table} converted to utf8mb4.`);
            } catch (err: any) {
                if (err.message.includes('syntax error') || err.message.includes('near "ALTER"')) {
                    console.log(`ℹ️ Table ${table}: Skipping (Likely not a MySQL database).`);
                } else {
                    console.error(`❌ Table ${table}: Error - ${err.message}`);
                }
            }
        }

        console.log("Process finished.");
    } catch (err: any) {
        console.error("Critical error:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixMySQLCharset();
