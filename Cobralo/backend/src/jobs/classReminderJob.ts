import cron from 'node-cron';
import { prisma } from '../db';
import { notificationService } from '../services/notificationService';
import crypto from 'crypto';

export async function runClassReminderJob() {
    console.log('--- 🕒 Running Class Reminders Job ---');
    try {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Fetch all schedules for PRO users who have class reminders enabled
        const schedules = await (prisma as any).classSchedule.findMany({
            where: {
                dayOfWeek: currentDayOfWeek,
                owner: {
                    isPro: true,
                    classRemindersEnabled: true,
                },
            },
            include: {
                owner: true,
                student: true,
                students: true,
            },
        });

        let remindersSent = 0;

        for (const schedule of schedules) {
            const minutesBefore = (schedule.owner as any).classReminderMinutes ?? 120;
            const minTarget = currentMinutes + minutesBefore - 15;
            const maxTarget = currentMinutes + minutesBefore;

            const [hours, mins] = schedule.startTime.split(':').map(Number);
            const startMinutes = hours * 60 + mins;

            if (startMinutes > minTarget && startMinutes <= maxTarget) {
                const participants: any[] = [];
                if (schedule.student) participants.push(schedule.student);
                if (schedule.students?.length > 0) participants.push(...schedule.students);

                for (const student of participants) {
                    if (!student.phone) continue;

                    // Generate a unique token for this student+class+day
                    const confirmToken = crypto.randomBytes(16).toString('hex');
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Create attendance record with confirmation token
                    const attendance = await (prisma as any).attendance.create({
                        data: {
                            ownerId: schedule.ownerId,
                            studentId: student.id,
                            scheduleId: schedule.id,
                            status: 'pending',
                            date: today,
                            confirmToken,
                        },
                    });

                    const appBaseUrl = process.env.APP_BASE_URL || 'https://cobraloapp.com';
                    const confirmUrl = `${appBaseUrl}/confirmar/${confirmToken}`;
                    const cancelUrl = `${appBaseUrl}/cancelar/${confirmToken}`;

                    const message = notificationService.formatMessage(
                        schedule.owner.classReminderTemplate || null,
                        student,
                        schedule.owner,
                        'CLASS_REMINDER',
                        { start_time: schedule.startTime, confirmUrl, cancelUrl }
                    );

                    await notificationService.sendWhatsApp(student.phone, message);
                    remindersSent++;
                }
            }
        }

        console.log(`✅ Sent ${remindersSent} class reminders.`);
    } catch (error) {
        console.error('Error in class reminder job:', error);
    }
    console.log('--- 🏁 Class Reminders Job Finished ---');
}

export function initClassReminderCron() {
    cron.schedule('*/15 * * * *', () => {
        runClassReminderJob();
    });
    console.log('⏰ Scheduled Class Reminders Job (every 15 mins)');
}
