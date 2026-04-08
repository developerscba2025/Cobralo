import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET /api/notifications - Last 50 for the authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const notifications = await prisma.notification.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const count = await prisma.notification.count({
            where: { ownerId: userId, isRead: false },
        });
        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch count' });
    }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        await prisma.notification.updateMany({
            where: { ownerId: userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// PATCH /api/notifications/:id/read - Mark one as read
router.patch('/:id/read', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const id = parseInt(req.params.id as string);
        await prisma.notification.update({
            where: { id, ownerId: userId },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

router.get('/confirm/:token', async (req: Request, res: Response) => {
    try {
        const token = req.params.token as string;
        const attendance = await prisma.attendance.findUnique({
            where: { confirmToken: token },
            include: { student: true, owner: true, schedule: true },
        });

        if (!attendance) {
            return res.status(404).json({ error: 'Token inválido o expirado.' });
        }

        const classDate = new Date(attendance.date);
        classDate.setHours(23, 59, 59, 999);
        const deadline = new Date(classDate.getTime() + 24 * 60 * 60 * 1000);
        
        if (new Date() > deadline) {
            return res.status(400).json({ error: 'Este enlace ya venció. Solo es válido hasta 24 horas después de la clase.' });
        }

        if (attendance.confirmedAt) {
            return res.json({ 
                alreadyConfirmed: true,
                studentName: (attendance as any).student.name,
                time: (attendance as any).schedule?.startTime,
            });
        }

        // Validar límite Free Rider Owner (Para presionar al profesor moroso)
        if (!(attendance as any).owner.isPro || (attendance as any).owner.plan !== 'PRO') {
             const studentCount = await prisma.student.count({
                 where: { ownerId: attendance.ownerId }
             });
             if (studentCount > 5) {
                 return res.status(403).json({ error: 'La plataforma no procesará más ingresos hasta que la academia libere cupos o active el plan PRO.' });
             }
        }

        // Validar capacidad
        if (attendance.scheduleId && attendance.schedule?.capacity) {
            const checkDate = new Date(attendance.date);
            const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

            const currentConfirmed = await prisma.attendance.count({
                where: {
                    scheduleId: attendance.scheduleId,
                    status: 'present',
                    date: { gte: startOfDay, lte: endOfDay }
                }
            });

            if (currentConfirmed >= attendance.schedule.capacity) {
                return res.status(400).json({ error: 'La clase ya está llena. Capacidad máxima alcanzada.' });
            }
        }

        // Mark as confirmed
        await prisma.attendance.update({
            where: { id: attendance.id },
            data: { confirmedAt: new Date(), status: 'present' },
        });

        // Create a notification for the owner (teacher)
        await prisma.notification.create({
            data: {
                ownerId: attendance.ownerId,
                type: 'CLASS_CONFIRMED',
                title: '✅ Alumno confirmó asistencia',
                body: `${(attendance as any).student.name} confirmó su asistencia a la clase${(attendance as any).schedule ? ` de las ${(attendance as any).schedule.startTime}` : ''}.`,
                metadata: JSON.stringify({ studentId: attendance.studentId, scheduleId: attendance.scheduleId }),
            },
        });

        res.json({ 
            confirmed: true,
            studentName: (attendance as any).student.name,
            time: (attendance as any).schedule?.startTime,
            teacherName: (attendance as any).owner.bizName || (attendance as any).owner.name,
        });
    } catch (error) {
        console.error('Confirm attendance error:', error);
        res.status(500).json({ error: 'Error al confirmar asistencia.' });
    }
});

// PUBLIC: GET /api/notifications/cancel/:token - Student cancels attendance
router.get('/cancel/:token', async (req: Request, res: Response) => {
    try {
        const token = req.params.token as string;
        const attendance = await prisma.attendance.findUnique({
            where: { confirmToken: token },
            include: { student: true, owner: true, schedule: true },
        });

        if (!attendance) {
            return res.status(404).json({ error: 'Token inválido o expirado.' });
        }

        // Zombie link protection
        const classDate = new Date(attendance.date);
        classDate.setHours(23, 59, 59, 999);
        const deadline = new Date(classDate.getTime() + 24 * 60 * 60 * 1000);
        
        if (new Date() > deadline) {
            return res.status(400).json({ error: 'Este enlace ya venció. Solo es válido hasta 24 horas después de la clase.' });
        }
        
        // Prevent cancelling if already confirmed or cancelled
        if (attendance.confirmedAt || attendance.status === 'absent') {
            return res.json({ 
                alreadyConfirmed: true,
                error: 'Esta clase ya fue procesada.'
            });
        }

        await prisma.attendance.update({
            where: { id: attendance.id },
            data: { status: 'absent' },
        });

        await prisma.notification.create({
            data: {
                ownerId: attendance.ownerId,
                type: 'CLASS_CANCELLED',
                title: '❌ Alumno canceló su clase',
                body: `${(attendance as any).student.name} canceló su asistencia a la clase${(attendance as any).schedule ? ` de las ${(attendance as any).schedule.startTime}` : ''}.`,
                metadata: JSON.stringify({ studentId: attendance.studentId, scheduleId: attendance.scheduleId }),
            },
        });

        res.json({ 
            cancelled: true,
            studentName: (attendance as any).student.name,
            teacherName: (attendance as any).owner.bizName || (attendance as any).owner.name,
        });
    } catch (error) {
        console.error('Cancel attendance error:', error);
        res.status(500).json({ error: 'Error al cancelar asistencia.' });
    }
});

export default router;
