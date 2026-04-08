import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/students - Get all students for the authenticated user
 */
export const getAllStudents = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { page = 1, limit = 50, all = "false" } = req.query;
        const isAll = all === "true";

        const queryOptions: any = {
            where: { ownerId: req.userId, isActive: true },
            include: { schedules: true },
            orderBy: { name: 'asc' }
        };

        if (!isAll) {
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            queryOptions.skip = (pageNum - 1) * limitNum;
            queryOptions.take = limitNum;
            
            const total = await prisma.student.count({ where: queryOptions.where });
            const students = await prisma.student.findMany(queryOptions);
            return res.json({
                data: students,
                total,
                page: pageNum,
                totalPages: Math.ceil(total / limitNum)
            });
        }

        const students = await prisma.student.findMany(queryOptions);
        res.json(students);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).json({ error: 'Error fetching students' });
    }
};

/**
 * GET /api/students/:id - Get a specific student
 */
export const getStudentById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const student = await prisma.student.findFirst({
            where: {
                id: parseInt(id as string),
                ownerId: req.userId
            },
            include: {
                payments: {
                    orderBy: { paidAt: 'desc' },
                    take: 5
                },
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 10
                },
                schedules: true,
                notes: {
                    orderBy: { createdAt: 'desc' },
                    take: 3
                }
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        res.json(student);
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        res.status(500).json({ error: 'Error al obtener estudiante' });
    }
};

export const getWhatsappDigest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const student = await prisma.student.findUnique({
            where: { id: Number(id), ownerId: req.userId },
            include: { owner: true }
        });

        if (!student) {
            res.status(404).json({ error: 'Alumno no encontrado' });
            return;
        }

        const currency = student.owner.currency || '$';
        let amountText = 'Estás al día.';
        
        if (student.status !== 'paid') {
            amountText = `Tu deuda pendiente es de ${currency}${Number(student.balance_due || student.amount).toLocaleString('es-AR')}.`;
        }

        // Recuperar si hay cuenta bancaria
        const bankData = await prisma.businessPaymentAccount.findFirst({
            where: { ownerId: req.userId, isDefault: true } // Assuming they have one Default
        });

        const paymentOptions = bankData ? `Podes transferir al Alias/CBU: ${bankData.alias}` : '';

        // Generate text
        let message = `Hola ${student.name.split(' ')[0]},\nTe escribo de *${student.owner.bizName || student.owner.name}*.\n\n${amountText}\n`;
        
        if (student.planType === 'PACK') {
            message += `Te quedan ${student.credits} clases en tu pack.\n`;
        }

        if (paymentOptions) {
            message += `\n${paymentOptions}`;
        }

        const link = `https://wa.me/${student.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`;

        res.json({ link, message });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar el resumen' });
    }
};

/**
 * POST /api/students - Create a new student
 */
export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }

        // El límite de estudiantes se verifica mediante el middleware checkStudentLimit
        // en la ruta POST /api/students

        const student = await prisma.student.create({
            data: {
                ownerId: req.userId,
                name: req.body.name,
                phone: req.body.phone,
                service_name: req.body.service_name,
                sub_category: req.body.sub_category || null,
                price_per_hour: req.body.price_per_hour ? parseFloat(String(req.body.price_per_hour)) : null,
                class_duration_min: req.body.class_duration_min ? parseInt(String(req.body.class_duration_min)) : null,
                classes_per_month: req.body.classes_per_month ? parseInt(String(req.body.classes_per_month)) : null,
                amount: req.body.amount ? parseFloat(String(req.body.amount)) : null,
                payment_method: req.body.payment_method || null,
                surcharge_percentage: req.body.surcharge_percentage ? parseInt(String(req.body.surcharge_percentage)) : null,
                deadline_day: req.body.deadline_day ? parseInt(String(req.body.deadline_day)) : null,
                due_day: req.body.due_day ? parseInt(String(req.body.due_day)) : null,
                planType: req.body.planType || 'MONTHLY',
                credits: req.body.credits ? parseInt(String(req.body.credits)) : 0,
                billing_alias: req.body.billing_alias || null,
                status: 'pending',
                schedules: req.body.schedules ? {
                    create: req.body.schedules.map((s: any) => ({
                        ...s,
                        ownerId: req.userId
                    }))
                } : undefined
            },
            include: { schedules: true }
        });

        res.json(student);
    } catch (error) {
        console.error('Error al crear estudiante:', error);
        res.status(500).json({ error: 'Error creating student' });
    }
};

/**
 * PUT /api/students/:id - Update a student
 */
export const updateStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const student = await prisma.student.update({
            where: { 
                id: Number(id),
                ownerId: req.userId
            },
            data: {
                name: req.body.name,
                phone: req.body.phone,
                service_name: req.body.service_name,
                price_per_hour: req.body.price_per_hour ? parseFloat(String(req.body.price_per_hour)) : null,
                class_duration_min: req.body.class_duration_min ? parseInt(String(req.body.class_duration_min)) : null,
                classes_per_month: req.body.classes_per_month ? parseInt(String(req.body.classes_per_month)) : null,
                amount: req.body.amount ? parseFloat(String(req.body.amount)) : null,
                payment_method: req.body.payment_method || null,
                surcharge_percentage: req.body.surcharge_percentage ? parseInt(String(req.body.surcharge_percentage)) : null,
                deadline_day: req.body.deadline_day ? parseInt(String(req.body.deadline_day)) : null,
                due_day: req.body.due_day ? parseInt(String(req.body.due_day)) : null,
                planType: req.body.planType || undefined,
                credits: req.body.credits ? parseInt(String(req.body.credits)) : undefined,
                sub_category: req.body.sub_category !== undefined ? req.body.sub_category : undefined,
                billing_alias: req.body.billing_alias !== undefined ? req.body.billing_alias : undefined,
                status: req.body.status !== undefined ? req.body.status : undefined,
                makeup_classes: req.body.makeup_classes !== undefined ? parseInt(String(req.body.makeup_classes)) : undefined,
                schedules: req.body.schedules ? {
                    deleteMany: {
                        id: {
                            notIn: req.body.schedules.filter((s: any) => s.id).map((s: any) => s.id)
                        }
                    },
                    upsert: req.body.schedules.map((s: any) => ({
                        where: { id: s.id || -1 },
                        update: {
                            dayOfWeek: s.dayOfWeek,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            isRecurring: s.isRecurring,
                            date: s.date
                        },
                        create: {
                            ownerId: req.userId,
                            dayOfWeek: s.dayOfWeek,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            isRecurring: s.isRecurring,
                            date: s.date
                        }
                    }))
                } : undefined
            },
            include: { schedules: true }
        });

        res.json(student);
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        res.status(500).json({ error: 'Error updating student' });
    }
};

/**
 * DELETE /api/students/:id - Delete a student
 */
export const deleteStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        await prisma.student.update({
            where: { 
                id: Number(id),
                ownerId: req.userId
            },
            data: { isActive: false }
        });

        res.json({ message: 'Student deleted' });
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        res.status(500).json({ error: 'Error deleting student' });
    }
};

/**
 * PATCH /api/students/:id/toggle - Toggle student status
 */
export const toggleStudentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const student = await prisma.student.findUnique({
            where: {
                id: Number(id),
                ownerId: req.userId
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        const newStatus = student.status === 'paid' ? 'pending' : 'paid';

        const updated = await prisma.student.update({
            where: { id: Number(id), ownerId: req.userId },
            data: { status: newStatus }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error updating student' });
    }
};

/**
 * PUT /api/students/update-prices - Update student prices
 */
export const updatePrices = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { percentage, service } = req.body;

        if (!percentage) {
            res.status(400).json({ error: 'Porcentaje requerido' });
            return;
        }

        const factor = 1 + (Number(percentage) / 100);

        if (service && service !== 'ALL') {
            await prisma.$executeRaw`
                UPDATE students 
                SET amount = ROUND(amount * ${factor}), 
                    price_per_hour = ROUND(price_per_hour * ${factor})
                WHERE service_name = ${service} 
                  AND "ownerId" = ${req.userId}
                  AND "excludeFromMassiveIncreases" = false
            `;
        } else {
            await prisma.$executeRaw`
                UPDATE students 
                SET amount = ROUND(amount * ${factor}), 
                    price_per_hour = ROUND(price_per_hour * ${factor})
                WHERE "ownerId" = ${req.userId}
                  AND "excludeFromMassiveIncreases" = false
            `;
        }

        res.json({ message: `Aumento del ${percentage}% aplicado correctamente.` });
    } catch (error) {
        console.error('Error updating prices:', error);
        res.status(500).json({ error: 'Error updating prices' });
    }
};

/**
 * POST /api/students/reset-month - Reset all students to pending
 */
export const resetMonth = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const result = await prisma.student.updateMany({
            where: { 
                status: 'paid',
                ownerId: req.userId,
                OR: [
                    { paidUntil: null },
                    { paidUntil: { lt: new Date() } }
                ]
            },
            data: { status: 'pending' }
        });

        res.json({
            message: `${result.count} alumnos marcados como pendientes.`,
            count: result.count
        });
    } catch (error) {
        console.error('Error resetting month:', error);
        res.status(500).json({ error: 'Error resetting month' });
    }
};

/**
 * GET /api/students/pending-contacts - Get pending students for mass WhatsApp
 */
export const getPendingContacts = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const pendingStudents = await prisma.student.findMany({
            where: {
                ownerId: req.userId,
                status: 'pending',
                phone: { not: null },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                phone: true,
                amount: true,
                service_name: true,
                deadline_day: true,
                payment_method: true,
                surcharge_percentage: true,
                sub_category: true,
                billing_alias: true
            }
        });

        res.json(pendingStudents);
    } catch (error) {
        console.error('Error fetching pending contacts:', error);
        res.status(500).json({ error: 'Error fetching pending contacts' });
    }
};
