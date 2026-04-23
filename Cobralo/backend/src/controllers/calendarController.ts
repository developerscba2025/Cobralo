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
                },
                students: {
                    select: { id: true, name: true, service_name: true, phone: true }
                },
                group: {
                    select: { id: true, name: true, color: true, subcategory: true }
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
                },
                students: {
                    select: { id: true, name: true, service_name: true }
                },
                group: {
                    select: { id: true, name: true, color: true, subcategory: true }
                }
            },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });

        // Group by day
        const weekly = DAYS.map((dayName, index) => ({
            day: index,
            dayName,
            classes: schedules.filter((s: any) => s.dayOfWeek === index)
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
        const { studentId, studentIds, dayOfWeek, startTime, endTime, date, isRecurring, title, capacity, groupId, subcategory } = req.body;

        // If title is provided, student selection is optional
        const hasStudents = (studentId !== undefined || (studentIds && studentIds.length > 0));
        
        if (!title && !hasStudents) {
            res.status(400).json({ error: 'Debes seleccionar al menos un alumno o dar nombre al grupo' });
            return;
        }

        if (!startTime || !endTime) {
            res.status(400).json({ error: 'La hora de inicio y fin son obligatorias' });
            return;
        }

        if (!req.userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // Verificar que los estudiantes pertenezcan al usuario
        const idsToVerify = studentIds ? studentIds.map(Number) : (studentId ? [Number(studentId)] : []);
        if (idsToVerify.length > 0) {
            const validCount = await prisma.student.count({
                where: {
                    id: { in: idsToVerify },
                    ownerId: req.userId
                }
            });

            if (validCount !== idsToVerify.length) {
                res.status(403).json({ error: 'Uno o más alumnos especificados no te pertenecen' });
                return;
            }
        }

        // For dated classes, derive dayOfWeek from the date (0=Sun, 1=Mon...)
        let resolvedDayOfWeek: number;
        if (date) {
            // Append time to prevent UTC timezone parsing issues with 'YYYY-MM-DD'
            const safeDate = date.includes('T') ? date : `${date}T12:00:00`;
            resolvedDayOfWeek = new Date(safeDate).getDay();
        } else if (dayOfWeek !== undefined) {
            resolvedDayOfWeek = Number(dayOfWeek);
        } else {
            res.status(400).json({ error: 'Se requiere dayOfWeek o date' });
            return;
        }

        const recurring = isRecurring !== undefined ? Boolean(isRecurring) : !date;

        // Check for conflicts only on same dayOfWeek and same date (if provided)
        const conflictWhere: any = {
            ownerId: req.userId,
            dayOfWeek: resolvedDayOfWeek,
            OR: [
                { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
                { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
                { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] }
            ]
        };
        if (date) conflictWhere.date = date;

        const conflicts = await prisma.classSchedule.findMany({
            where: conflictWhere,
            include: {
                student: { select: { name: true } },
                students: { select: { name: true } }
            }
        });

        const connectIds = studentIds ? studentIds.map((id: number) => ({ id: Number(id) })) : (studentId ? [{ id: Number(studentId) }] : []);

        const requestedCapacity = req.body.capacity ? Number(req.body.capacity) : null;
        if (requestedCapacity !== null && connectIds.length > requestedCapacity) {
            return res.status(400).json({ error: `La capacidad máxima es de ${requestedCapacity} alumnos.` });
        }

        const schedule = await prisma.classSchedule.create({
            data: {
                ownerId: req.userId,
                title: title || null,
                studentId: (studentIds || !studentId) ? null : Number(studentId),
                dayOfWeek: resolvedDayOfWeek,
                date: date || null,
                isRecurring: recurring,
                startTime,
                endTime,
                capacity: capacity ? Number(capacity) : null,
                groupId: groupId ? Number(groupId) : null,
                subcategory: subcategory || null,
                students: {
                    connect: connectIds
                }
            },
            include: {
                student: { select: { id: true, name: true } },
                students: { select: { id: true, name: true } },
                group: { select: { id: true, name: true, color: true, subcategory: true } }
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
        const { dayOfWeek, startTime, endTime, studentIds, capacity, title, groupId, subcategory } = req.body;

        const scheduleId = Number(id);

        if (studentIds !== undefined) {
            const idsToVerify = studentIds.map(Number);
            const validCount = await prisma.student.count({
                where: {
                    id: { in: idsToVerify },
                    ownerId: req.userId
                }
            });

            if (validCount !== idsToVerify.length) {
                res.status(403).json({ error: 'Uno o más alumnos especificados no te pertenecen' });
                return;
            }

            // Check capacity before proceeding
            const existingSchedule = await prisma.classSchedule.findUnique({
                where: { id: scheduleId, ownerId: req.userId },
                select: { capacity: true }
            });

            if (!existingSchedule) {
                return res.status(404).json({ error: 'Clase no encontrada' });
            }

            const currentCapacity = capacity !== undefined ? (capacity === null ? null : Number(capacity)) : existingSchedule.capacity;

            if (currentCapacity !== null && idsToVerify.length > currentCapacity) {
                return res.status(400).json({ error: `La capacidad máxima de la clase es de ${currentCapacity} alumnos.` });
            }
        }

        // Step 1: If studentIds provided, update the many-to-many relation separately
        if (studentIds !== undefined) {
            await prisma.classSchedule.update({
                where: { id: scheduleId, ownerId: req.userId },
                data: {
                    students: {
                        set: studentIds.map((sid: number) => ({ id: Number(sid) }))
                    }
                }
            });
        }

        // Step 2: Build update for scalar fields only (skip if nothing to update)
        const scalarData: any = {};
        if (dayOfWeek !== undefined) scalarData.dayOfWeek = Number(dayOfWeek);
        if (startTime !== undefined) scalarData.startTime = startTime;
        if (endTime !== undefined) scalarData.endTime = endTime;
        if (title !== undefined) scalarData.title = title === '' ? null : title;
        if (capacity !== undefined) scalarData.capacity = capacity === null ? null : Number(capacity);
        if (groupId !== undefined) scalarData.groupId = groupId === null ? null : Number(groupId);
        if (subcategory !== undefined) scalarData.subcategory = subcategory === null ? null : subcategory;

        if (Object.keys(scalarData).length > 0) {
            await prisma.classSchedule.update({
                where: { id: scheduleId, ownerId: req.userId },
                data: scalarData
            });
        }

        // Step 3: Return the updated schedule with all relations
        const schedule = await prisma.classSchedule.findFirst({
            where: { id: scheduleId, ownerId: req.userId },
            include: {
                student: { select: { id: true, name: true } },
                students: { select: { id: true, name: true } },
                group: { select: { id: true, name: true, color: true, subcategory: true } }
            }
        });

        res.json(schedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
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
