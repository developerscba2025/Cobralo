import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/attendance - Get all attendance records for the user
 */
export const getAllAttendance = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { studentId, month, year } = req.query;
        let whereClause: any = { ownerId: req.userId };

        if (studentId) whereClause.studentId = parseInt(studentId as string);
        if (month || year) {
            whereClause.date = {
                gte: new Date(
                    parseInt(year as string) || new Date().getFullYear(),
                    (parseInt(month as string) || new Date().getMonth()) - 1,
                    1
                )
            };
        }

        const attendance = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        res.json(attendance);
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({ error: 'Error al obtener asistencias' });
    }
};

/**
 * GET /api/attendance/student/:studentId - Get attendance for a specific student
 */
export const getStudentAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const studentId = parseInt(id as string);
        
        if (isNaN(studentId)) {
            return res.status(400).json({ error: 'ID de alumno inválido' });
        }

        if (!req.userId) {
            return res.status(401).json({ error: 'Autenticación requerida' });
        }

        // Verificar que el estudiante pertenece al usuario
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                ownerId: req.userId
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        const attendance = await prisma.attendance.findMany({
            where: {
                studentId,
                ownerId: req.userId
            },
            include: {
                schedule: {
                    select: {
                        startTime: true,
                        endTime: true,
                        dayOfWeek: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: 50
        });

        res.json(attendance);
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({ error: 'Error al obtener asistencias' });
    }
};

/**
 * POST /api/attendance - Record attendance
 */
export const recordAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, status, date, scheduleId } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        if (!studentId || !status) {
            res.status(400).json({
                error: 'studentId y status son requeridos'
            });
            return;
        }

        // Verificar que el estudiante pertenece al usuario
        const studentExists = await prisma.student.findFirst({
            where: {
                id: parseInt(studentId as any),
                ownerId: req.userId
            }
        });

        if (!studentExists) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        const result = await prisma.$transaction(async (prismaTransaction) => {
            // Anti-double-click logic
            const checkDate = date ? new Date(date) : new Date();
            const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
            
            const existingAttendance = await prismaTransaction.attendance.findFirst({
                where: {
                    ownerId: req.userId!,
                    studentId: parseInt(studentId as any),
                    scheduleId: scheduleId ? parseInt(scheduleId as any) : null,
                    date: { gte: startOfDay, lte: endOfDay }
                }
            });

            if (existingAttendance) {
                return existingAttendance;
            }

            // 1. Create attendance record
            const attendance = await prismaTransaction.attendance.create({
                data: {
                    ownerId: req.userId!,
                    studentId: parseInt(studentId as any),
                    status,
                    date: date ? new Date(date) : new Date(),
                    scheduleId: scheduleId ? parseInt(scheduleId as any) : null
                }
            });

            // 2. If student is PACK and status is PRESENT, decrement credits
            const student = await prismaTransaction.student.findUnique({ 
                where: { 
                    id: parseInt(studentId as any),
                    ownerId: req.userId!
                } 
            });

            if (student?.planType === 'PACK' && (status === 'PRESENT' || status === 'ABSENT')) {
                if ((student.credits || 0) > 0) {
                    await prismaTransaction.student.update({
                        where: { id: parseInt(studentId as any) },
                        data: { credits: { decrement: 1 } }
                    });
                }
            }

            // 3. If status is CANCELLED (Falta con Aviso), increment makeup_classes
            if (status === 'CANCELLED') {
                await prismaTransaction.student.update({
                    where: { id: parseInt(studentId as any) },
                    data: { makeup_classes: { increment: 1 } }
                });
            } else if (status === 'MAKEUP' && (student?.makeup_classes || 0) > 0) {
                await prismaTransaction.student.update({
                    where: { id: parseInt(studentId as any) },
                    data: { makeup_classes: { decrement: 1 } }
                });
            }

            return attendance;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        res.status(500).json({ error: 'Error al registrar asistencia' });
    }
};

/**
 * PUT /api/attendance/:id - Update attendance
 */
export const updateAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const attendance = await prisma.attendance.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!attendance) {
            res.status(404).json({ error: 'Registro de asistencia no encontrado' });
            return;
        }

        const updated = await prisma.attendance.update({
            where: { id: parseInt(id as any) },
            data: req.body
        });

        res.json({
            message: 'Asistencia actualizada con éxito',
            attendance: updated
        });
    } catch (error) {
        console.error('Error al actualizar asistencia:', error);
        res.status(500).json({ error: 'Error al actualizar asistencia' });
    }
};

/**
 * DELETE /api/attendance/:id - Delete attendance
 */
export const deleteAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const attendance = await prisma.attendance.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!attendance) {
            res.status(404).json({ error: 'Registro de asistencia no encontrado' });
            return;
        }

        await prisma.attendance.delete({
            where: { id: parseInt(id as any) }
        });

        res.json({ message: 'Registro de asistencia eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar asistencia:', error);
        res.status(500).json({ error: 'Error al eliminar asistencia' });
    }
};

/**
 * POST /api/attendance/bulk - Record multiple attendance records
 */
export const recordBulkAttendance = async (req: AuthRequest, res: Response) => {
    try {
        const { scheduleId, records, date } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        if (!records || !Array.isArray(records)) {
            res.status(400).json({ error: 'Records array is required' });
            return;
        }

        // Verificar que todos los estudiantes pertenezcan al usuario
        const uniqueStudentIds = [...new Set(records.map(r => Number(r.studentId)))];
        const validCount = await prisma.student.count({
            where: {
                id: { in: uniqueStudentIds },
                ownerId: req.userId
            }
        });

        if (validCount !== uniqueStudentIds.length) {
            res.status(403).json({ error: 'Uno o más alumnos especificados no te pertenecen' });
            return;
        }

        const attendanceDate = date ? new Date(date) : new Date();

        const results = await prisma.$transaction(async (tx) => {
            const createdRecords = [];

            for (const record of records) {
                const { studentId, status } = record;

                const checkDate = new Date(attendanceDate);
                const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

                const existingAtt = await tx.attendance.findFirst({
                    where: {
                        ownerId: req.userId!,
                        studentId: Number(studentId),
                        scheduleId: scheduleId ? Number(scheduleId) : null,
                        date: { gte: startOfDay, lte: endOfDay }
                    }
                });

                if (existingAtt) {
                    createdRecords.push(existingAtt);
                    continue;
                }

                // 1. Create attendance record
                const att = await tx.attendance.create({
                    data: {
                        ownerId: req.userId!,
                        studentId: Number(studentId),
                        status,
                        date: attendanceDate,
                        scheduleId: scheduleId ? Number(scheduleId) : null
                    }
                });

                // 2. If student is PACK and status is PRESENT, decrement credits
                const student = await tx.student.findUnique({ 
                    where: { 
                        id: Number(studentId),
                        ownerId: req.userId!
                    } 
                });

                if (student?.planType === 'PACK' && (status === 'PRESENT' || status === 'ABSENT')) {
                    if ((student.credits || 0) > 0) {
                        await tx.student.update({
                            where: { id: Number(studentId) },
                            data: { credits: { decrement: 1 } }
                        });
                    }
                }

                // 3. If status is CANCELLED (Falta con Aviso), increment makeup_classes
                if (status === 'CANCELLED') {
                    await tx.student.update({
                        where: { id: Number(studentId) },
                        data: { makeup_classes: { increment: 1 } }
                    });
                } else if (status === 'MAKEUP' && (student?.makeup_classes || 0) > 0) {
                    await tx.student.update({
                        where: { id: Number(studentId) },
                        data: { makeup_classes: { decrement: 1 } }
                    });
                }

                createdRecords.push(att);
            }

            return createdRecords;
        });

        res.status(201).json(results);
    } catch (error) {
        console.error('Error al registrar asistencias múltiples:', error);
        res.status(500).json({ error: 'Error al registrar asistencias' });
    }
};
