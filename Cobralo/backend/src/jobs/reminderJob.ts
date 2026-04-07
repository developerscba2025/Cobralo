import cron from 'node-cron';
import { prisma } from '../db';
import { notificationService } from '../services/notificationService';

/**
 * Task to analyze and send reminders
 */
export async function runReminderJob() {
    console.log('--- 🕒 Running Automated Reminders Job ---');
    
    try {
        const today = new Date();
        const inTwoDays = new Date(today);
        inTwoDays.setDate(today.getDate() + 2);
        
        const targetDay = inTwoDays.getDate();
        
        // 1. PRO AUTOMATED REMINDERS (Exactly 2 days before)
        // Only for users with isPro = true or PRO plan
        const proStudents = await prisma.student.findMany({
            where: {
                due_day: targetDay,
                status: 'pending',
                owner: {
                    OR: [
                        { isPro: true },
                        { plan: 'PRO' }
                    ]
                }
            },
            include: { owner: true }
        });

        console.log(`[PRO] Found ${proStudents.length} students with payments due in 2 days.`);

        for (const student of proStudents) {
            const message = notificationService.formatMessage(
                student.owner.reminderTemplate,
                student,
                student.owner,
                'UPCOMING'
            );
            
            // Send actual WhatsApp (or simulate if no token)
            const sent = await notificationService.sendWhatsApp(student.phone || '', message);
            
            // LOG IN THE TEACHER'S NOTIFICATION CENTER (Campanita)
            await prisma.notification.create({
                data: {
                    ownerId: student.ownerId,
                    type: 'PRO_REMINDER_SENT',
                    title: '🤖 Recordatorio Automático',
                    body: `Se envió aviso a ${student.name} (${student.owner.currency || '$'}${student.amount?.toString() || '0'}) - Vence en 2 días.`,
                    metadata: JSON.stringify({ 
                        studentId: student.id, 
                        method: 'whatsapp',
                        status: sent ? 'sent' : 'simulated'
                    })
                }
            });
            
            console.log(`✅ Pro reminder handled for ${student.name}`);
        }

        // 2. Overdue checks for standard users can stay or be unified.
        // For now, let's keep it lean to fulfill the "Option 1" fast-track request.

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
    cron.schedule('0 10 * * *', () => {
        runReminderJob();
    });
    
    console.log('⏰ Scheduled Daily Reminders Job (10:00 AM)');
}

