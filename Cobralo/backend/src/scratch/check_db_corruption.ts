
import { prisma } from '../db';

async function checkTemplates() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            reminderTemplate: true,
            classReminderTemplate: true,
            welcomeTemplate: true,
            generalTemplate: true
        }
    });

    console.log("Checking user templates for corruption...");
    users.forEach(u => {
        console.log(`User ID: ${u.id} (${u.email})`);
        const templates = {
            reminder: u.reminderTemplate,
            class: u.classReminderTemplate,
            welcome: u.welcomeTemplate,
            general: u.generalTemplate
        };

        for (const [name, val] of Object.entries(templates)) {
            if (val) {
                const hasFFFD = val.includes('\uFFFD');
                const hex = val.split('').map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join(' ');
                console.log(`  - ${name}: ${hasFFFD ? '❌ HAS REPLACEMENT CHAR' : '✅ OK'}`);
                if (hasFFFD) {
                    console.log(`    Content: ${val}`);
                    console.log(`    Hex: ${hex}`);
                }
            }
        }
    });
}

checkTemplates().catch(console.error);
