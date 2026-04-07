import { runReminderJob } from '../jobs/reminderJob';
import { prisma } from '../db';

async function main() {
    console.log('🚀 Manual Trigger: Automated Reminders Job');
    
    // Check if there are any students for testing
    // Tip: Ensure you have at least one student with isPro: true and due_day = today + 2
    const today = new Date();
    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);
    const targetDay = inTwoDays.getDate();
    
    const count = await prisma.student.count({
        where: {
            due_day: targetDay,
            status: 'pending',
            owner: {
                OR: [{ isPro: true }, { plan: 'PRO' }]
            }
        }
    });
    
    if (count === 0) {
        console.warn(`⚠️ No students found for target day ${targetDay} with PRO owner.`);
        console.log('Suggestion: Update a student in the database to match this day before running.');
    } else {
        console.log(`Found ${count} students to process.`);
    }

    await runReminderJob();
    
    console.log('🏁 Manual trigger finished.');
    process.exit(0);
}

main().catch(err => {
    console.error('Error triggering job:', err);
    process.exit(1);
});
