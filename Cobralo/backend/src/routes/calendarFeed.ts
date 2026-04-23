import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * GET /api/calendar/feed/:token
 * Public route to serve ICS calendar feed
 */
router.get('/feed/:token', async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        if (!token || typeof token !== 'string') {
            res.status(400).send('Token is required');
            return;
        }

        const user = await prisma.user.findUnique({
            where: { calendarToken: token as string },
            include: {
                schedules: {
                    include: {
                        student: true
                    }
                }
            }
        });

        if (!user) {
            res.status(404).send('Invalid token');
            return;
        }

        if (!user.isPro && user.plan !== 'INITIAL') {
            res.status(403).send('Calendar sync is a PRO feature. Please upgrade your plan.');
            return;
        }

        const schedules = (user as any).schedules || [];
        const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
        
        // Helper to compute the most recent past date for a given day of week
        const getRecentWeekday = (dayOfWeek: number): Date => {
            const now = new Date();
            const currentDay = now.getDay(); // 0=Sun, 1=Mon...
            let diff = currentDay - dayOfWeek;
            if (diff < 0) diff += 7;
            const result = new Date(now);
            result.setDate(now.getDate() - diff);
            return result;
        };

        const formatICSDate = (date: Date, time: string): string => {
            const [hours, minutes] = time.split(':');
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}00`;
        };
        
        const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        let icsContent = "BEGIN:VCALENDAR\r\n";
        icsContent += "VERSION:2.0\r\n";
        icsContent += "PRODID:-//Cobralo//Calendar Feed//ES\r\n";
        icsContent += "CALSCALE:GREGORIAN\r\n";
        icsContent += "METHOD:PUBLISH\r\n";
        icsContent += `X-WR-CALNAME:Cobralo - ${user.bizName || user.name}\r\n`;
        icsContent += "X-WR-TIMEZONE:America/Argentina/Buenos_Aires\r\n";
        icsContent += "X-APPLE-CALENDAR-COLOR:#10B981\r\n"; // Emerald for Apple Calendar

        schedules.forEach((s: any) => {
            const baseDate = getRecentWeekday(s.dayOfWeek);
            const dtstart = formatICSDate(baseDate, s.startTime || '09:00');
            const dtend = formatICSDate(baseDate, s.endTime || '10:00');
            const studentName = s.student?.name || 'Alumno';
            const serviceName = s.student?.service_name || 'General';

            icsContent += "BEGIN:VEVENT\r\n";
            icsContent += `UID:cobralo-${s.id}@cobralo.info\r\n`;
            icsContent += `DTSTAMP:${nowStamp}\r\n`;
            icsContent += `SUMMARY:Clase: ${studentName}\r\n`;
            icsContent += `DESCRIPTION:Servicio: ${serviceName}\\nAlumno: ${studentName}\r\n`;
            icsContent += `CATEGORIES:Cobralo,Clases\r\n`;
            icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[s.dayOfWeek]}\r\n`;
            icsContent += `DTSTART;TZID=America/Argentina/Buenos_Aires:${dtstart}\r\n`;
            icsContent += `DTEND;TZID=America/Argentina/Buenos_Aires:${dtend}\r\n`;
            icsContent += "END:VEVENT\r\n";
        });

        icsContent += "END:VCALENDAR";

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename=calendar.ics');
        res.send(icsContent);

    } catch (error) {
        console.error('Error generating calendar feed:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
