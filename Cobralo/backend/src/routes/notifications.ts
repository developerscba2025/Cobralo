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

        if (attendance.confirmedAt) {
            return res.json({ 
                alreadyConfirmed: true,
                studentName: (attendance as any).student.name,
                time: (attendance as any).schedule?.startTime,
            });
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
