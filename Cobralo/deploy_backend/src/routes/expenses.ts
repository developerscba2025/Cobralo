import { Router } from 'express';
import {
    getAllExpenses,
    getCurrentMonthExpenses,
    createExpense,
    deleteExpense,
    updateExpense
} from '../controllers/expenseController';

const router = Router();

// GET all expenses
router.get('/', getAllExpenses);

// GET expenses for current month
router.get('/current', getCurrentMonthExpenses);

// POST create expense
router.post('/', createExpense);

// PUT update expense (new feature added by controller)
router.put('/:id', updateExpense);

// DELETE expense
router.delete('/:id', deleteExpense);

export default router;
