import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/payments - Get all payments for the authenticated user
 */
export const getAllPayments = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { year, month, studentId } = req.query;

        const where: any = { ownerId: req.userId };
        if (year) where.year = Number(year);
        if (month) where.month = Number(month);
        if (studentId) where.studentId = Number(studentId);

        const payments = await prisma.paymentHistory.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        service_name: true
                    }
                }
            },
            orderBy: { paidAt: 'desc' }
        });

        res.json(payments);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
};

/**
 * GET /api/payments/stats - Get payment stats by month/year
 */
export const getPaymentStats = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }
        
        const currentYear = new Date().getFullYear();
        const year = Number(req.query.year) || currentYear;

        const monthlyStats = await prisma.$queryRaw<Array<{ month: number; total: number; count: number }>>`
            SELECT 
                month,
                CAST(SUM(amount) AS DECIMAL(10,2)) as total,
                COUNT(*) as count
            FROM payment_history
            WHERE year = ${year} AND ownerId = ${req.userId}
            GROUP BY month
            ORDER BY month
        `;

        const stats = Array.from({ length: 12 }, (_, i) => {
            const found = monthlyStats.find(s => s.month === i + 1);
            return {
                month: i + 1,
                total: found ? Number(found.total) : 0,
                count: found ? Number(found.count) : 0
            };
        });

        res.json({ year, stats });
    } catch (error) {
        console.error('Error fetching payment stats:', error);
        res.status(500).json({ error: 'Error fetching payment stats' });
    }
};

/**
 * GET /api/payments/analytics - Get advanced analytics
 */
export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }
        
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;

        const currentYearTotal = await prisma.paymentHistory.aggregate({
            _sum: { amount: true },
            where: { 
                year: currentYear,
                ownerId: req.userId
            }
        });

        const lastYearTotal = await prisma.paymentHistory.aggregate({
            _sum: { amount: true },
            where: { 
                year: lastYear,
                ownerId: req.userId
            }
        });

        const topStudents = await prisma.paymentHistory.groupBy({
            by: ['studentId'],
            _sum: { amount: true },
            where: { 
                year: currentYear,
                ownerId: req.userId
            },
            orderBy: { _sum: { amount: 'desc' } },
            take: 5
        });

        const enrichedTopStudents = await Promise.all(
            topStudents.map(async (item) => {
                const student = await prisma.student.findUnique({
                    where: { 
                        id: item.studentId,
                        ownerId: req.userId!
                    },
                    select: { name: true, service_name: true }
                });
                return {
                    ...item,
                    name: student?.name,
                    service: student?.service_name,
                    total: Number(item._sum.amount)
                };
            })
        );

        res.json({
            yearComparison: {
                current: Number(currentYearTotal._sum.amount) || 0,
                last: Number(lastYearTotal._sum.amount) || 0,
                growth: (((Number(currentYearTotal._sum.amount) || 0) - (Number(lastYearTotal._sum.amount) || 0)) / (Number(lastYearTotal._sum.amount) || 1)) * 100
            },
            topStudents: enrichedTopStudents
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Error fetching analytics' });
    }
};

/**
 * GET /api/payments/student/:studentId - Get payments for a specific student
 */
export const getPaymentsByStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const student = await prisma.student.findFirst({
            where: {
                id: parseInt(studentId as any),
                ownerId: req.userId
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        const payments = await prisma.paymentHistory.findMany({
            where: {
                studentId: parseInt(studentId as any),
                ownerId: req.userId
            },
            orderBy: { paidAt: 'desc' }
        });

        res.json(payments);
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
};

/**
 * POST /api/payments - Record a new payment
 */
export const createPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, amount, paidAt, month, year } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        if (!studentId || !amount || month === undefined || year === undefined) {
            res.status(400).json({
                error: 'studentId, amount, month y year son requeridos'
            });
            return;
        }

        const student = await prisma.student.findFirst({
            where: {
                id: parseInt(studentId as any),
                ownerId: req.userId
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        const payment = await prisma.paymentHistory.create({
            data: {
                ownerId: req.userId,
                studentId: parseInt(studentId as any),
                amount: parseFloat(amount),
                paidAt: paidAt ? new Date(paidAt) : new Date(),
                month: parseInt(month),
                year: parseInt(year)
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.json(payment);
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ error: 'Error al registrar pago' });
    }
};

/**
 * PUT /api/payments/:id - Update a payment
 */
export const updatePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const payment = await prisma.paymentHistory.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!payment) {
            res.status(404).json({ error: 'Pago no encontrado' });
            return;
        }

        const updated = await prisma.paymentHistory.update({
            where: { id: parseInt(id as any) },
            data: {
                ...req.body,
                amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
                month: req.body.month ? parseInt(req.body.month) : undefined,
                year: req.body.year ? parseInt(req.body.year) : undefined
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error al actualizar pago:', error);
        res.status(500).json({ error: 'Error al actualizar pago' });
    }
};

/**
 * DELETE /api/payments/:id - Delete a payment
 */
export const deletePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const payment = await prisma.paymentHistory.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!payment) {
            res.status(404).json({ error: 'Pago no encontrado' });
            return;
        }

        await prisma.paymentHistory.delete({
            where: { id: parseInt(id as any) }
        });

        res.json({ message: 'Payment deleted' });
    } catch (error) {
        console.error('Error al eliminar pago:', error);
        res.status(500).json({ error: 'Error al eliminar pago' });
    }
};
