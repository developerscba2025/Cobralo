import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * GET /api/calendar - Get all schedules for the user
 */
export const getAllSchedules = async (req: AuthRequest, res: Response) => {
    try {
        const { dayOfWeek } = req.query;

        const where: any = { ownerId: req.userId };
        if (dayOfWeek !== undefined) where.dayOfWeek = Number(dayOfWeek);

        const schedules = await prisma.classSchedule.findMany({
            where,
            include: {
                student: {
                    select: { id: true, name: true, service_name: true, phone: true }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Error fetching schedules' });
    }
};

/**
 * GET /api/calendar/student/:studentId - Get schedules for a specific student
 */
export const getStudentSchedules = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;
        const schedules = await prisma.classSchedule.findMany({
            where: { 
                studentId: Number(studentId),
                ownerId: req.userId
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching student schedules' });
    }
};

/**
 * GET /api/calendar/weekly - Get weekly summary
 */
export const getWeeklySchedule = async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await prisma.classSchedule.findMany({
            where: { ownerId: req.userId },
            include: {
                student: {
                    select: { id: true, name: true, service_name: true }
                }
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });

        // Group by day
        const weekly = DAYS.map((dayName, index) => ({
            day: index,
            dayName,
            classes: schedules.filter(s => s.dayOfWeek === index)
        }));

        res.json(weekly);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching weekly schedule' });
    }
};

/**
 * POST /api/calendar - Create a new schedule
 */
export const createSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, dayOfWeek, startTime, endTime } = req.body;

        if (studentId === undefined || dayOfWeek === undefined || !startTime || !endTime) {
            res.status(400).json({ error: 'Todos los campos son requeridos' });
            return;
        }

        if (!req.userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Check for conflicts
        const conflicts = await prisma.classSchedule.findMany({
            where: {
                ownerId: req.userId,
                dayOfWeek: Number(dayOfWeek),
                OR: [
                    { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
                    { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
                    { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
                ]
            },
            include: {
                student: { select: { name: true } }
            }
        });

        const schedule = await prisma.classSchedule.create({
            data: {
                ownerId: req.userId,
                studentId: Number(studentId),
                dayOfWeek: Number(dayOfWeek),
                startTime,
                endTime
            },
            include: {
                student: { select: { id: true, name: true } }
            }
        });

        res.json({ ...schedule, conflicts });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Error creating schedule' });
    }
};

/**
 * PUT /api/calendar/:id - Update a schedule
 */
export const updateSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { dayOfWeek, startTime, endTime } = req.body;

        const schedule = await prisma.classSchedule.update({
            where: { 
                id: Number(id),
                ownerId: req.userId
            },
            data: {
                dayOfWeek: Number(dayOfWeek),
                startTime,
                endTime
            }
        });
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Error updating schedule' });
    }
};

/**
 * DELETE /api/calendar/:id - Delete a schedule
 */
export const deleteSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.classSchedule.delete({
            where: { 
                id: Number(id),
                ownerId: req.userId
            }
        });
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting schedule' });
    }
};
