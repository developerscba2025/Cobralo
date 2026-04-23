
import { prisma } from '../db';

async function cleanupData() {
    console.log("Cleaning up corrupted data in the database...");
    
    // We target the User table where templates are stored
    const users = await prisma.user.findMany();
    
    for (const user of users) {
        const updates: any = {};
        const templateFields = ['reminderTemplate', 'classReminderTemplate', 'welcomeTemplate', 'generalTemplate', 'bizName', 'name'];
        
        for (const field of templateFields) {
            const val = (user as any)[field];
            if (val && (val.includes('\uFFFD') || val.includes(''))) {
                console.log(`🧹 Cleaning ${field} for user ${user.email}...`);
                // Replace corrupted character with a safe space or just strip it
                // and normalize to NFC
                updates[field] = val.normalize('NFC').replace(/[\uFFFD]/g, '').trim();
            }
        }
        
        if (Object.keys(updates).length > 0) {
            await prisma.user.update({
                where: { id: user.id },
                data: updates
            });
            console.log(`✅ User ${user.email} updated.`);
        }
    }

    console.log("Cleanup finished.");
}

cleanupData().catch(console.error).finally(() => prisma.$disconnect());
