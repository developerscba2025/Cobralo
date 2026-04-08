import { Request, Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { getMercadoPagoPayment } from '../services/mercadoPagoService';
import { decrypt } from '../utils/crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Argentina/Buenos_Aires');
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
        
        const currentYear = dayjs.tz().year();
        const year = Number(req.query.year) || currentYear;

        const monthlyStats = await prisma.paymentHistory.groupBy({
            by: ['month'],
            where: {
                year,
                ownerId: req.userId
            },
            _sum: {
                amount: true
            },
            _count: {
                id: true
            }
        });
        
        // Map the results to a 12-month array
        const stats = Array.from({ length: 12 }, (_, i) => {
            const found = monthlyStats.find(s => s.month === i + 1);
            return {
                month: i + 1,
                total: found?._sum?.amount ? Number(found._sum.amount) : 0,
                count: found?._count?.id ? Number(found._count.id) : 0
            };
        });

        res.json({ year, stats });
    } catch (error) {
        console.error('CRITICAL: Error fetching payment stats:', error);
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
        res.status(500).json({ 
            error: 'Error fetching payment stats',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
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
        
        const currentYear = dayjs.tz().year();
        const currentMonth = dayjs.tz().month() + 1;
        
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const yearOfLastMonth = currentMonth === 1 ? currentYear - 1 : currentYear;

        const currentMonthTotal = await prisma.paymentHistory.aggregate({
            _sum: { amount: true },
            where: { 
                year: currentYear,
                month: currentMonth,
                ownerId: req.userId
            }
        });

        const lastMonthTotal = await prisma.paymentHistory.aggregate({
            _sum: { amount: true },
            where: { 
                year: yearOfLastMonth,
                month: lastMonth,
                ownerId: req.userId
            }
        });

        const currentMonthExpenses = await prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
                year: currentYear,
                month: currentMonth,
                ownerId: req.userId
            }
        });

        const lastMonthExpenses = await prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
                year: yearOfLastMonth,
                month: lastMonth,
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

        const currentIncome = Number(currentMonthTotal._sum.amount) || 0;
        const lastIncome = Number(lastMonthTotal._sum.amount) || 0;
        const currentExp = Number(currentMonthExpenses._sum.amount) || 0;
        const lastExp = Number(lastMonthExpenses._sum.amount) || 0;

        res.json({
            yearComparison: {
                current: currentIncome,
                last: lastIncome,
                growth: lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0,
                netIncome: currentIncome - currentExp,
                expenses: currentExp,
                period: 'Mensual (vs. mes anterior)'
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
                paidAt: paidAt ? dayjs.tz(paidAt).toDate() : dayjs.tz().toDate(),
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

        await prisma.student.update({
            where: { id: parseInt(studentId as any) },
            data: { status: 'paid' }
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
                amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
                month: req.body.month ? parseInt(req.body.month) : undefined,
                year: req.body.year ? parseInt(req.body.year) : undefined,
                paidAt: req.body.paidAt ? new Date(req.body.paidAt) : undefined
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

        // Revertir a pending si no quedan pagos para ese alumno en ese mes específico
        const remainingPayments = await prisma.paymentHistory.findFirst({
            where: {
                studentId: payment.studentId,
                ownerId: req.userId,
                month: payment.month,
                year: payment.year
            }
        });

        if (!remainingPayments) {
            await prisma.student.update({
                where: { id: payment.studentId },
                data: { status: 'pending' }
            });
        }

        res.json({ message: 'Payment deleted' });
    } catch (error) {
        console.error('Error al eliminar pago:', error);
        res.status(500).json({ error: 'Error al eliminar pago' });
    }
};

/**
 * POST /api/payments/webhook/:userId - Handler for student Mercado Pago payments
 */
export const handleStudentPaymentWebhook = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { type, data } = req.body;

        // MP sends type "payment" and data.id
        if (type !== 'payment' || !data?.id) {
            res.status(200).send('OK'); 
            return;
        }

        const paymentId = data.id;

        // Fetch user to get their custom MP Token
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { mpAccessToken: true }
        });

        if (!user || !user.mpAccessToken) {
            res.status(404).send('User or Token not found');
            return;
        }

        const decryptedToken = decrypt(user.mpAccessToken);
        const payment = await getMercadoPagoPayment(paymentId, decryptedToken);

        const { status, external_reference } = payment;

        if (status === 'approved' && external_reference?.startsWith('student-')) {
            // external_reference format: `student-${studentId}-user-${userId}` or `student-${studentId}-user-${userId}-month-${month}-year-${year}`
            const match = external_reference.match(/student-(\d+)-user-\d+(?:-month-(\d+)-year-(\d+))?/);
            if (match) {
                const studentId = Number(match[1]);
                const refMonth = match[2] ? Number(match[2]) : dayjs.tz().month() + 1;
                const refYear = match[3] ? Number(match[3]) : dayjs.tz().year();

                // Mover a pagado
                await prisma.student.update({
                    where: { id: studentId },
                    data: { status: 'paid' }
                });

                // Evitar duplicados (MercadoPago puede enviar el webhook más de una vez)
                const existingPayment = await prisma.paymentHistory.findFirst({
                    where: {
                        mpPaymentId: paymentId.toString()
                    }
                });

                if (!existingPayment) {
                    await prisma.paymentHistory.create({
                        data: {
                            ownerId: Number(userId),
                            studentId: studentId,
                            amount: payment.transaction_amount,
                            paidAt: new Date(payment.date_approved || payment.date_created),
                            month: refMonth,
                            year: refYear,
                            mpPaymentId: paymentId.toString()
                        }
                    });
                }
            }
        }

        res.status(200).send('Webhook Processed');
    } catch (error) {
        console.error('Error procesando webhook de alumno:', error);
        res.status(500).send('Error');
    }
};
