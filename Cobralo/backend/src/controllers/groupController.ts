import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

const GROUP_INCLUDE = {
    service: { select: { id: true, name: true, defaultPrice: true } },
    students: { select: { id: true, name: true, phone: true, service_name: true, status: true } },
    schedules: {
        orderBy: [{ dayOfWeek: 'asc' as const }, { startTime: 'asc' as const }]
    }
};

/**
 * GET /api/groups - Get all groups for the user
 */
export const getGroups = async (req: AuthRequest, res: Response) => {
    try {
        const groups = await prisma.group.findMany({
            where: { ownerId: req.userId!, isActive: true },
            include: GROUP_INCLUDE,
            orderBy: { name: 'asc' }
        });
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Error fetching groups' });
    }
};

/**
 * GET /api/groups/:id - Get a single group
 */
export const getGroup = async (req: AuthRequest, res: Response) => {
    try {
        const group = await prisma.group.findFirst({
            where: { id: Number(req.params.id), ownerId: req.userId! },
            include: GROUP_INCLUDE
        });
        if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching group' });
    }
};

/**
 * POST /api/groups - Create a new group
 */
export const createGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { name, serviceId, capacity, color, subcategory, notes, studentIds } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ error: 'El nombre del grupo es obligatorio' });
        }

        // Validate students belong to the user
        const idsToConnect: number[] = studentIds ? studentIds.map(Number) : [];
        if (idsToConnect.length > 0) {
            const validCount = await prisma.student.count({
                where: { id: { in: idsToConnect }, ownerId: req.userId! }
            });
            if (validCount !== idsToConnect.length) {
                return res.status(403).json({ error: 'Uno o más alumnos no te pertenecen' });
            }
        }

        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                ownerId: req.userId!,
                serviceId: serviceId ? Number(serviceId) : null,
                capacity: capacity ? Number(capacity) : null,
                color: color || null,
                subcategory: subcategory || null,
                notes: notes || null,
                students: idsToConnect.length > 0 ? { connect: idsToConnect.map(id => ({ id })) } : undefined
            },
            include: GROUP_INCLUDE
        });

        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Error creating group' });
    }
};

/**
 * PUT /api/groups/:id - Update a group
 */
export const updateGroup = async (req: AuthRequest, res: Response) => {
    try {
        const groupId = Number(req.params.id);
        const { name, serviceId, capacity, color, subcategory, notes, isActive } = req.body;

        const existing = await prisma.group.findFirst({
            where: { id: groupId, ownerId: req.userId! }
        });
        if (!existing) return res.status(404).json({ error: 'Grupo no encontrado' });

        const data: any = {};
        if (name !== undefined) data.name = name.trim();
        if (serviceId !== undefined) data.serviceId = serviceId ? Number(serviceId) : null;
        if (capacity !== undefined) data.capacity = capacity ? Number(capacity) : null;
        if (color !== undefined) data.color = color || null;
        if (subcategory !== undefined) data.subcategory = subcategory || null;
        if (notes !== undefined) data.notes = notes || null;
        if (isActive !== undefined) data.isActive = Boolean(isActive);

        const group = await prisma.group.update({
            where: { id: groupId },
            data,
            include: GROUP_INCLUDE
        });
        res.json(group);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Error updating group' });
    }
};

/**
 * DELETE /api/groups/:id - Soft-delete a group (marks as inactive, does NOT delete schedules)
 */
export const deleteGroup = async (req: AuthRequest, res: Response) => {
    try {
        const groupId = Number(req.params.id);

        const existing = await prisma.group.findFirst({
            where: { id: groupId, ownerId: req.userId! }
        });
        if (!existing) return res.status(404).json({ error: 'Grupo no encontrado' });

        // Detach all schedules from this group (they stay as standalone schedules)
        await prisma.classSchedule.updateMany({
            where: { groupId, ownerId: req.userId! },
            data: { groupId: null }
        });

        // Soft delete (mark as inactive) - keeps the group data for history
        await prisma.group.update({
            where: { id: groupId },
            data: { isActive: false }
        });

        res.json({ message: 'Grupo eliminado. Los horarios se conservaron como clases individuales.' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Error deleting group' });
    }
};

/**
 * POST /api/groups/:id/students - Add students to a group
 */
export const addStudentsToGroup = async (req: AuthRequest, res: Response) => {
    try {
        const groupId = Number(req.params.id);
        const { studentIds } = req.body;

        if (!studentIds?.length) {
            return res.status(400).json({ error: 'Se requiere al menos un alumno' });
        }

        const idsToAdd: number[] = studentIds.map(Number);

        // Validate ownership
        const validCount = await prisma.student.count({
            where: { id: { in: idsToAdd }, ownerId: req.userId! }
        });
        if (validCount !== idsToAdd.length) {
            return res.status(403).json({ error: 'Uno o más alumnos no te pertenecen' });
        }

        // Check capacity
        const group = await prisma.group.findFirst({
            where: { id: groupId, ownerId: req.userId! },
            include: { 
                students: { select: { id: true } },
                schedules: { select: { id: true } }
            }
        });
        if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

        if (group.capacity) {
            const newTotal = group.students.length + idsToAdd.filter((id: number) => !group.students.find((s: any) => s.id === id)).length;
            if (newTotal > group.capacity) {
                return res.status(400).json({ error: `El grupo tiene un cupo máximo de ${group.capacity} alumnos` });
            }
        }

        const updated = await prisma.group.update({
            where: { id: groupId },
            data: { students: { connect: idsToAdd.map(id => ({ id })) } },
            include: GROUP_INCLUDE
        });

        // Also add students to ALL schedules linked to this group
        if (group.schedules) {
            const scheduleIds = (group as any).schedules?.map((s: any) => s.id) || [];
            for (const scheduleId of scheduleIds) {
                await prisma.classSchedule.update({
                    where: { id: scheduleId },
                    data: { students: { connect: idsToAdd.map(id => ({ id })) } }
                });
            }
        }

        res.json(updated);
    } catch (error) {
        console.error('Error adding students to group:', error);
        res.status(500).json({ error: 'Error adding students' });
    }
};

/**
 * DELETE /api/groups/:id/students/:studentId - Remove a student from a group
 */
export const removeStudentFromGroup = async (req: AuthRequest, res: Response) => {
    try {
        const groupId = Number(req.params.id);
        const studentId = Number(req.params.studentId);

        const group = await prisma.group.findFirst({
            where: { id: groupId, ownerId: req.userId! },
            include: { schedules: { select: { id: true } } }
        });
        if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

        // Remove from group
        await prisma.group.update({
            where: { id: groupId },
            data: { students: { disconnect: { id: studentId } } }
        });

        // Also remove from ALL linked schedules
        for (const schedule of group.schedules) {
            await prisma.classSchedule.update({
                where: { id: schedule.id },
                data: { students: { disconnect: { id: studentId } } }
            });
        }

        const updated = await prisma.group.findFirst({
            where: { id: groupId },
            include: GROUP_INCLUDE
        });

        res.json(updated);
    } catch (error) {
        console.error('Error removing student from group:', error);
        res.status(500).json({ error: 'Error removing student' });
    }
};

/**
 * POST /api/groups/:id/schedules - Create a new schedule linked to the group
 */
export const addScheduleToGroup = async (req: AuthRequest, res: Response) => {
    try {
        const groupId = Number(req.params.id);
        const { dayOfWeek, startTime, endTime, isRecurring, date } = req.body;

        const group = await prisma.group.findFirst({
            where: { id: groupId, ownerId: req.userId! },
            include: { students: { select: { id: true } } }
        });
        if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

        if (!startTime || !endTime) {
            return res.status(400).json({ error: 'Hora de inicio y fin son obligatorias' });
        }

        let resolvedDayOfWeek = dayOfWeek;
        if (date) {
            const safeDate = date.includes('T') ? date : `${date}T12:00:00`;
            resolvedDayOfWeek = new Date(safeDate).getDay();
        }

        const schedule = await prisma.classSchedule.create({
            data: {
                ownerId: req.userId!,
                groupId,
                title: group.name,
                dayOfWeek: resolvedDayOfWeek ?? 1,
                startTime,
                endTime,
                isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : !date,
                date: date || null,
                capacity: group.capacity,
                subcategory: group.subcategory,
                students: {
                    connect: group.students.map((s: any) => ({ id: s.id }))
                }
            },
            include: {
                students: { select: { id: true, name: true } },
                group: { select: { id: true, name: true, color: true } }
            }
        });

        res.status(201).json(schedule);
    } catch (error) {
        console.error('Error adding schedule to group:', error);
        res.status(500).json({ error: 'Error adding schedule' });
    }
};

/**
 * POST /api/groups/:id/schedules/link - Link an existing schedule to a group
 */
export const linkScheduleToGroup = async (req: AuthRequest, res: Response) => {
    try {
        const groupId = Number(req.params.id);
        const { scheduleId } = req.body;

        const group = await prisma.group.findFirst({
            where: { id: groupId, ownerId: req.userId! },
            include: { students: { select: { id: true } } }
        });
        if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

        const schedule = await prisma.classSchedule.findFirst({
            where: { id: Number(scheduleId), ownerId: req.userId! }
        });
        if (!schedule) return res.status(404).json({ error: 'Horario no encontrado' });

        const updated = await prisma.classSchedule.update({
            where: { id: Number(scheduleId) },
            data: {
                groupId,
                title: schedule.title || group.name,
                students: { connect: group.students.map((s: any) => ({ id: s.id })) }
            },
            include: {
                students: { select: { id: true, name: true } },
                group: { select: { id: true, name: true, color: true } }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error linking schedule to group:', error);
        res.status(500).json({ error: 'Error linking schedule' });
    }
};
