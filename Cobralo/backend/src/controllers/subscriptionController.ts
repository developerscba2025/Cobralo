import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import {
    createMercadoPagoPreference,
    BASE_SUBSCRIPTION_PLANS,
    getCalculatedPlans,
    getMercadoPagoPayment,
    getMercadoPagoPreference
} from '../services/mercadoPagoService';
import { decrypt } from '../utils/crypto';

/**
 * GET /api/subscription/plans - Get available subscription plans
 */
export const getAvailablePlans = async (req: AuthRequest, res: Response) => {
    try {
        const dynamicPlans = await getCalculatedPlans();
        const ipcUpdateSetting = await prisma.systemSetting.findUnique({ where: { key: 'last_ipc_update' } });
        const pendingAdjustmentSetting = await prisma.systemSetting.findUnique({ where: { key: 'pending_price_adjustment' } });

        const plans = Object.entries(dynamicPlans).map(([key, plan]) => ({
            ...plan,
            priceFormatted: `$${Number(plan.price).toLocaleString('es-AR')}`
        }));

        res.json({
            plans,
            lastUpdate: ipcUpdateSetting?.value || new Date().toISOString(),
            pendingAdjustment: pendingAdjustmentSetting ? JSON.parse(pendingAdjustmentSetting.value) : null
        });
    } catch (error) {
        console.error('Error getting subscription plans:', error);
        res.status(500).json({ error: 'Error al obtener planes' });
    }
};

/**
 * GET /api/subscription/current - Get current subscription info
 */
export const getCurrentSubscription = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                isPro: true,
                plan: true,
                subscriptionExpiry: true
            }
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.userId }
        });

        res.json({
            isPro: user.isPro,
            plan: user.plan,
            subscriptionExpiry: user.subscriptionExpiry,
            subscription: subscription || null
        });
    } catch (error) {
        console.error('Error getting current subscription:', error);
        res.status(500).json({ error: 'Error al obtener suscripción' });
    }
};

/**
 * POST /api/subscription/checkout - Create a checkout session for a plan
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { planId } = req.body;
        const plans = await getCalculatedPlans();

        if (!planId || !(planId in plans)) {
            res.status(400).json({ error: 'Plan inválido' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { email: true, name: true }
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Crear preferencia en Mercado Pago
        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription-callback`;

        const mpPreference = await createMercadoPagoPreference(
            req.userId,
            planId as keyof typeof BASE_SUBSCRIPTION_PLANS,
            returnUrl
        );

        // Guardar referencia de preferencia en base de datos
        const subscription = await prisma.subscription.upsert({
            where: { userId: req.userId },
            update: {
                mercadoPagoPreferenceId: mpPreference.preferenceId,
                plan: planId
            },
            create: {
                userId: req.userId,
                plan: planId,
                status: 'pending',
                mercadoPagoPreferenceId: mpPreference.preferenceId
            }
        });

        res.json({
            preferenceId: mpPreference.preferenceId,
            checkoutUrl: mpPreference.initPoint,
            sandboxCheckoutUrl: mpPreference.sandboxInitPoint
        });
    } catch (error: any) {
        const mpError = error?.response?.data;
        console.error('Error creating checkout session:', mpError || error?.message || error);
        console.error('MP Access Token present:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
        res.status(500).json({ 
            error: 'Error al crear sesión de pago',
            detail: mpError?.message || mpError?.error || error?.message
        });
    }
};

/**
 * POST /api/payments/create-link - Create a payment link for a student
 */
export const createStudentPaymentLink = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { studentId, amount, title } = req.body;

        if (!studentId || !amount) {
            res.status(400).json({ error: 'studentId y amount son requeridos' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { mpAccessToken: true, bizName: true }
        });

        if (!user?.mpAccessToken) {
            res.status(400).json({ error: 'Debes configurar tu Access Token de Mercado Pago en Ajustes' });
            return;
        }

        const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`;

        let decryptedToken = user.mpAccessToken;
        try {
            decryptedToken = decrypt(user.mpAccessToken);
        } catch (e) {
            console.warn('Could not decrypt token, assuming it is legacy plain text format.');
        }

        const mpPreference = await createMercadoPagoPreference(
            req.userId,
            'CLASS_PAYMENT',
            returnUrl,
            decryptedToken,
            { 
                title: title || `Clase de ${user.bizName || 'Tu Profe'}`, 
                amount: Number(amount), 
                studentId: Number(studentId) 
            }
        );

        res.json({
            checkoutUrl: mpPreference.initPoint,
            preferenceId: mpPreference.preferenceId
        });
    } catch (error) {
        console.error('Error creating student payment link:', error);
        res.status(500).json({ error: 'Error al crear link de pago' });
    }
};


/**
 * POST /api/subscription/webhook - Mercado Pago webhook handler
 * Este endpoint recibe notificaciones de Mercado Pago cuando un pago es confirmado
 */
export const handleMercadoPagoWebhook = async (req: any, res: Response) => {
    try {
        const { type, data } = req.body;

        // Webhook received

        // Solo procesar notificaciones de pagos
        if (type !== 'payment') {
            res.status(200).json({ received: true });
            return;
        }

        const paymentId = data.id;

        if (!paymentId) {
            res.status(400).json({ error: 'Payment ID required' });
            return;
        }

        // Obtener detalles del pago desde Mercado Pago
        const payment = await getMercadoPagoPayment(paymentId);

        // Payment details fetched

        // Extraer información del pago
        const { status, external_reference } = payment;

        // Extraer userId de la referencia externa (formato: user-123-pro-monthly)
        const userIdMatch = external_reference?.match(/user-(\d+)/);
        if (!userIdMatch) {
            console.error('Could not extract user ID from external_reference:', external_reference);
            res.status(200).json({ received: true });
            return;
        }

        const userId = parseInt(userIdMatch[1]);

        // Si el pago fue aprobado
        if (status === 'approved') {
            // Obtener el plan desde la suscripción pendiente
            const subscription = await prisma.subscription.findUnique({
                where: { userId }
            });

            if (!subscription) {
                console.error('Subscription not found for user:', userId);
                res.status(200).json({ received: true });
                return;
            }

            // Calcular fecha de expiración basada en el plan
            const expiryDate = new Date();
            const plan = subscription.plan as keyof typeof BASE_SUBSCRIPTION_PLANS;

            if (plan === 'PRO_MONTHLY') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else if (plan === 'PRO_TRIMESTRAL') {
                expiryDate.setMonth(expiryDate.getMonth() + 3);
            }

            // Actualizar usuario a Pro
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isPro: true,
                    plan: 'PRO',
                    subscriptionExpiry: expiryDate,
                    mercadoPagoCustomerId: payment.payer?.id?.toString()
                }
            });

            // Actualizar suscripción
            await prisma.subscription.update({
                where: { userId },
                data: {
                    status: 'active',
                    mercadoPagoOrderId: paymentId,
                    expiryDate,
                    startDate: new Date()
                }
            });

            console.log(`User ${userId} upgraded to Pro successfully`);
        }

        // Responder a Mercado Pago
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Error procesando webhook' });
    }
};

/**
 * GET /api/subscription/verify-payment/:paymentId - Verify payment status
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const { paymentId } = req.params;

        if (!paymentId) {
            res.status(400).json({ error: 'Payment ID required' });
            return;
        }

        const payment = await getMercadoPagoPayment(paymentId as string);

        res.json({
            status: payment.status,
            statusDetail: payment.status_detail,
            transactionAmount: payment.transaction_amount,
            currency: payment.currency_id,
            creationDate: payment.date_created,
            approvalDate: payment.date_approved
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Error al verificar pago' });
    }
};

/**
 * POST /api/subscription/cancel - Cancel current subscription
 */
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });

        if (!user?.isPro) {
            res.status(400).json({ error: 'Usuario no tiene suscripción activa' });
            return;
        }

        // Actualizar usuario
        await prisma.user.update({
            where: { id: req.userId },
            data: {
                isPro: false,
                plan: 'FREE',
                subscriptionExpiry: null
            }
        });

        // Marcar suscripción como cancelada
        await prisma.subscription.update({
            where: { userId: req.userId },
            data: {
                status: 'cancelled'
            }
        });

        res.json({ message: 'Suscripción cancelada exitosamente' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Error al cancelar suscripción' });
    }
};
