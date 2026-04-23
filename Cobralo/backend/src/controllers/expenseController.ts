import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/expenses - Get all expenses for the authenticated user
 */
export const getAllExpenses = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { month, year, category } = req.query;

        let whereClause: any = { ownerId: req.userId };

        if (month) whereClause.month = parseInt(month as string);
        if (year) whereClause.year = parseInt(year as string);
        if (category && category !== 'all') whereClause.category = category;

        const expenses = await prisma.expense.findMany({
            where: whereClause,
            orderBy: { date: 'desc' }
        });

        res.json(expenses);
    } catch (error) {
        console.error('Error al obtener gastos:', error);
        res.status(500).json({ error: 'Error al obtener gastos' });
    }
};

/**
 * GET /api/expenses/current - Get current month expenses
 */
export const getCurrentMonthExpenses = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const expenses = await prisma.expense.findMany({
            where: { 
                month, 
                year,
                ownerId: req.userId
            },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching current month expenses' });
    }
};

/**
 * POST /api/expenses - Create a new expense
 */
export const createExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { description, amount, category, date, month, year } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        if (!description || !amount) {
            res.status(400).json({
                error: 'description y amount son requeridos'
            });
            return;
        }

        const expenseDate = date ? new Date(date) : new Date();

        const expense = await prisma.expense.create({
            data: {
                ownerId: req.userId,
                description,
                amount: parseFloat(amount),
                category: category || 'General',
                date: expenseDate,
                month: expenseDate.getMonth() + 1,
                year: expenseDate.getFullYear()
            }
        });

        res.status(201).json({
            message: 'Gasto registrado con éxito',
            expense
        });
    } catch (error) {
        console.error('Error al crear gasto:', error);
        res.status(500).json({ error: 'Error al crear gasto' });
    }
};

/**
 * PUT /api/expenses/:id - Update an expense
 */
export const updateExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const expense = await prisma.expense.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!expense) {
            res.status(404).json({ error: 'Gasto no encontrado' });
            return;
        }

        const updated = await prisma.expense.update({
            where: { id: parseInt(id as any) },
            data: {
                description: req.body.description || undefined,
                amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
                category: req.body.category || undefined,
                date: req.body.date ? new Date(req.body.date) : undefined,
                month: req.body.month ? parseInt(req.body.month) : undefined,
                year: req.body.year ? parseInt(req.body.year) : undefined
            }
        });

        res.json({
            message: 'Gasto actualizado con éxito',
            expense: updated
        });
    } catch (error) {
        console.error('Error al actualizar gasto:', error);
        res.status(500).json({ error: 'Error al actualizar gasto' });
    }
};

/**
 * DELETE /api/expenses/:id - Delete an expense
 */
export const deleteExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const expense = await prisma.expense.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!expense) {
            res.status(404).json({ error: 'Gasto no encontrado' });
            return;
        }

        await prisma.expense.delete({
            where: { id: parseInt(id as any) }
        });

        res.json({ message: 'Gasto eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar gasto:', error);
        res.status(500).json({ error: 'Error al eliminar gasto' });
    }
};

/**
 * GET /api/expenses/monthly/summary - Get monthly expense summary
 */
export const getExpenseSummary = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { year } = req.query;
        const queryYear = year ? parseInt(year as string) : new Date().getFullYear();

        // Obtener todos los gastos del año
        const expenses = await prisma.expense.findMany({
            where: {
                ownerId: req.userId,
                year: queryYear
            },
            orderBy: { month: 'asc' }
        });

        // Agrupar por mes
        const summary = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            total: 0,
            count: 0,
            categories: {} as Record<string, number>
        }));

        expenses.forEach((exp: any) => {
            const monthIdx = exp.month - 1;
            summary[monthIdx].total += parseFloat(exp.amount.toString());
            summary[monthIdx].count += 1;

            if (!summary[monthIdx].categories[exp.category || 'General']) {
                summary[monthIdx].categories[exp.category || 'General'] = 0;
            }
            summary[monthIdx].categories[exp.category || 'General'] += parseFloat(exp.amount.toString());
        });

        res.json(summary);
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
};