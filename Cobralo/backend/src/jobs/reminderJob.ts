import cron from 'node-cron';
import { prisma } from '../db';
import { notificationService, NotificationType } from '../services/notificationService';

/**
 * Task to analyze and send reminders
 */
export async function runReminderJob() {
    console.log('--- 🕒 Running Automated Reminders Job ---');
    
    try {
        const today = new Date();
        const currentDay = today.getDate();
        
        // 1. Find upcoming payments (due in 3 days)
        // Note: This is simplified logic. Real production systems would handle month boundaries better.
        const targetUpcomingDay = currentDay + 3;
        
        const upcomingStudents = await prisma.student.findMany({
            where: {
                deadline_day: targetUpcomingDay,
                status: 'pending'
            },
            include: { owner: true }
        });

        console.log(`Found ${upcomingStudents.length} students with upcoming payments.`);

        for (const student of upcomingStudents) {
            const message = notificationService.formatMessage(
                student.owner.reminderTemplate,
                student,
                student.owner,
                'UPCOMING'
            );
            
            if (student.phone) {
                await notificationService.sendWhatsApp(student.phone, message);
            }
        }

        // 2. Find overdue payments (payment day passed)
        const overdueStudents = await prisma.student.findMany({
            where: {
                due_day: { lt: currentDay },
                status: 'pending'
            },
            include: { owner: true }
        });

        console.log(`Found ${overdueStudents.length} students with overdue payments.`);

        for (const student of overdueStudents) {
            const message = notificationService.formatMessage(
                student.owner.reminderTemplate,
                student,
                student.owner,
                'OVERDUE'
            );

            if (student.phone) {
                await notificationService.sendWhatsApp(student.phone, message);
            }
        }

    } catch (error) {
        console.error('Error in reminder job:', error);
    }
    
    console.log('--- ✅ Automated Reminders Job Finished ---');
}

/**
 * Initialize the cron schedule
 * Run daily at 10:00 AM
 */
export function initReminderCron() {
    // Cron expression: minute hour day-of-month month day-of-week
    cron.schedule('0 10 * * *', () => {
        runReminderJob();
    });
    
    console.log('⏰ Scheduled Daily Reminders Job (10:00 AM)');
}
