import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    getAvailablePlans,
    getCurrentSubscription,
    createCheckoutSession,
    handleMercadoPagoWebhook,
    verifyPayment,
    cancelSubscription
} from '../controllers/subscriptionController';

const router = Router();

/**
 * GET /api/subscription/plans - Get available plans
 * Público - no requiere autenticación
 */
router.get('/plans', getAvailablePlans);

/**
 * GET /api/subscription/current - Get current subscription
 * Requiere autenticación
 */
router.get('/current', authMiddleware, getCurrentSubscription);

/**
 * POST /api/subscription/checkout - Create checkout session
 * Requiere autenticación
 */
router.post('/checkout', authMiddleware, createCheckoutSession);

/**
 * GET /api/subscription/verify-payment/:paymentId - Verify payment
 * Requiere autenticación
 */
router.get('/verify-payment/:paymentId', authMiddleware, verifyPayment);

/**
 * POST /api/subscription/cancel - Cancel subscription
 * Requiere autenticación
 */
router.post('/cancel', authMiddleware, cancelSubscription);

/**
 * POST /api/subscription/webhook - Mercado Pago webhook
 * No requiere autenticación (Mercado Pago lo llamará)
 */
router.post('/webhook', handleMercadoPagoWebhook);

export default router;
