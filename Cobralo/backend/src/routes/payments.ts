import { Router } from 'express';
import {
    getAllPayments,
    getPaymentStats,
    getAnalytics,
    createPayment,
    deletePayment,
    updatePayment,
    handleStudentPaymentWebhook
} from '../controllers/paymentController';
import { createStudentPaymentLink } from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Webhook para cobros de alumnos (Público)
router.post('/webhook/:userId', handleStudentPaymentWebhook);

router.use(authMiddleware);

// POST create payment link for student
router.post('/create-link', createStudentPaymentLink);

// GET all payments with student info optionally filtered
router.get('/', getAllPayments);

// GET payment stats by month/year
router.get('/stats', getPaymentStats);

// GET advanced analytics
router.get('/analytics', getAnalytics);

// POST create payment record
router.post('/', createPayment);

// DELETE payment
router.delete('/:id', deletePayment);

// PUT update payment (available from controller)
router.put('/:id', updatePayment);

export default router;
