
import { prisma } from '../db';

async function deepAudit() {
    console.log("Deep Audit: Checking for non-BMP characters (emojis)...");
    
    const users = await prisma.user.findMany();
    for (const u of users) {
        const str = JSON.stringify(u);
        const nonBMP = str.match(/[^\u0000-\uFFFF]/g);
        if (nonBMP) {
            console.log(`✅ User ${u.email} HAS EMOJIS: ${nonBMP.join(' ')}`);
        } else {
            console.log(`ℹ️ User ${u.email} no emojis found.`);
        }
    }

    const students = await prisma.student.findMany();
    for (const s of students) {
        const str = JSON.stringify(s);
        const nonBMP = str.match(/[^\u0000-\uFFFF]/g);
        if (nonBMP) {
            console.log(`✅ Student ${s.name} HAS EMOJIS: ${nonBMP.join(' ')}`);
        }
    }

    console.log("Audit finished.");
}

deepAudit().catch(console.error).finally(() => prisma.$disconnect());
