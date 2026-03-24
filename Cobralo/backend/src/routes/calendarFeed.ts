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

        const schedules = (user as any).schedules || [];
        const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
        
        let icsContent = "BEGIN:VCALENDAR\n";
        icsContent += "VERSION:2.0\n";
        icsContent += "PRODID:-//Cobralo//Calendar Feed//ES\n";
        icsContent += "CALSCALE:GREGORIAN\n";
        icsContent += "METHOD:PUBLISH\n";
        icsContent += `X-WR-CALNAME:Cobralo - ${user.bizName || user.name}\n`;
        icsContent += "X-WR-TIMEZONE:America/Argentina/Buenos_Aires\n";

        schedules.forEach((s: any) => {
            const startStr = (s.startTime || "00:00").replace(":", "") + "00";
            const endStr = (s.endTime || "00:00").replace(":", "") + "00";

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `UID:schedule-${s.id}@cobralo.com\n`;
            icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\n`;
            icsContent += `SUMMARY:Clase: ${s.student?.name}\n`;
            icsContent += `DESCRIPTION:Servicio: ${s.student?.service_name || 'General'}\\nAlumno: ${s.student?.name}\n`;
            icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[s.dayOfWeek]}\n`;
            
            // Weekly pattern start (Monday Jan 1st 2024 as base for recurrence)
            icsContent += `DTSTART:20240101T${startStr}\n`;
            icsContent += `DTEND:20240101T${endStr}\n`;
            icsContent += "END:VEVENT\n";
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
