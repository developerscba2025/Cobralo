/**
 * Configuración de Mercado Pago
 */

import axios from 'axios';
import { prisma } from '../db';

export const mercadoPagoConfig = {
    get accessToken() { return process.env.MERCADO_PAGO_ACCESS_TOKEN || ''; },
    get publicKey() { return process.env.MERCADO_PAGO_PUBLIC_KEY || ''; },
    apiUrl: 'https://api.mercadopago.com'
};

/**
 * Cliente HTTP para Mercado Pago - usa getter para leer el token en cada request
 */
export const mercadoPagoClient = axios.create({
    baseURL: mercadoPagoConfig.apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para inyectar el token en el momento del request (no en carga del módulo)
mercadoPagoClient.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${mercadoPagoConfig.accessToken}`;
    return config;
});


/**
 * Planes de suscripción BASE (Precios sugeridos Abril 2026)
 */
export const BASE_SUBSCRIPTION_PLANS = {
    BASIC_MONTHLY: {
        id: 'basic-monthly',
        name: 'Plan Básico - Mensual',
        description: 'Gestión esencial de alumnos y cobros',
        price: 5242, // ARS 5242.00 (25% OFF from 6990)
        currency: 'ARS',
        billingCycle: 'month',
        durationMonths: 1
    },
    PRO_MONTHLY: {
        id: 'pro-monthly',
        name: 'Plan Pro - Mensual',
        description: 'Alumnos ilimitados, sincronización Google Calendar y automatización',
        price: 11242, // ARS 11242.00 (25% OFF from 14990)
        currency: 'ARS',
        billingCycle: 'month',
        durationMonths: 1
    },
    PRO_TRIMESTRAL: {
        id: 'pro-trimestral',
        name: 'Plan Pro - Trimestral',
        description: 'Suscripción por 3 meses con acceso total ilimitado',
        price: 30352, // ARS 30352.00 (25% OFF from 40470)
        currency: 'ARS',
        billingCycle: 'quarter',
        durationMonths: 3
    }
};

/**
 * Obtener los planes con el multiplicador de inflación aplicado
 */
export const getCalculatedPlans = async () => {
    // Buscar multiplicador y precios base
    const settingsKeys = ['ipc_multiplier', 'base_price_basic_monthly', 'base_price_pro_monthly', 'base_price_pro_trimestral'];
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: settingsKeys } }
    });

    const settingsMap = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    const factor = parseFloat(settingsMap['ipc_multiplier'] || '1.0');
    
    // Obtener precios base, con fallback a los hardcodeados
    const basePrices = {
        BASIC_MONTHLY: parseFloat(settingsMap['base_price_basic_monthly'] || String(BASE_SUBSCRIPTION_PLANS.BASIC_MONTHLY.price)),
        PRO_MONTHLY: parseFloat(settingsMap['base_price_pro_monthly'] || String(BASE_SUBSCRIPTION_PLANS.PRO_MONTHLY.price)),
        PRO_TRIMESTRAL: parseFloat(settingsMap['base_price_pro_trimestral'] || String(BASE_SUBSCRIPTION_PLANS.PRO_TRIMESTRAL.price)),
    };

    const plans: any = {};
    for (const [key, plan] of Object.entries(BASE_SUBSCRIPTION_PLANS)) {
        // Obtener el precio base actual para este plan
        const currentBasePrice = basePrices[key as keyof typeof basePrices] || plan.price;
        
        // Redondear a las decenas más cercanas para un precio "limpio"
        const dynamicPrice = Math.round((currentBasePrice * factor) / 10) * 10;
        plans[key] = { ...plan, price: dynamicPrice };
    }
    return plans as typeof BASE_SUBSCRIPTION_PLANS;
};

/**
 * Crear una preferencia de pago en Mercado Pago
 * @param customAccessToken Para cobrar a nombre del profesor
 */
export const createMercadoPagoPreference = async (
    userId: number,
    planId: keyof typeof BASE_SUBSCRIPTION_PLANS | 'CLASS_PAYMENT',
    returnUrl: string,
    customAccessToken?: string,
    classDetails?: { title: string; amount: number; studentId: number; month?: number; year?: number }
) => {
    try {
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${customAccessToken || mercadoPagoConfig.accessToken}`
        };

        let items = [];
        let external_reference = '';
        let metadata = {};

        if (planId === 'CLASS_PAYMENT' && classDetails) {
            items = [
                {
                    title: classDetails.title,
                    quantity: 1,
                    unit_price: classDetails.amount,
                    currency_id: 'ARS'
                }
            ];
            let extRef = `student-${classDetails.studentId}-user-${userId}`;
            if (classDetails.month && classDetails.year) {
                extRef += `-month-${classDetails.month}-year-${classDetails.year}`;
            }
            external_reference = extRef;
            metadata = { student_id: classDetails.studentId, user_id: userId, type: 'class_payment' };
        } else {
            const plans = await getCalculatedPlans();
            const plan = plans[planId as keyof typeof BASE_SUBSCRIPTION_PLANS];
            items = [
                {
                    title: plan.name,
                    description: plan.description,
                    quantity: 1,
                    unit_price: plan.price,
                    currency_id: plan.currency
                }
            ];
            external_reference = `user-${userId}-${String(planId)}`;
            metadata = { user_id: userId, plan_id: planId, type: 'subscription' };
        }

        const webhookUrl = process.env.WEBHOOK_BASE_URL || 'https://api.cobralo.app';

        const preference: any = {
            items,
            payer: {
                email: `user-${userId}@cobralo.app`
            },
            back_urls: {
                success: `${returnUrl}?status=success`,
                failure: `${returnUrl}?status=failure`,
                pending: `${returnUrl}?status=pending`
            },
            auto_return: 'approved',
            external_reference,
            metadata
        };

        if (planId !== 'CLASS_PAYMENT') {
            preference.expires = true;
            preference.expiration_date_from = new Date().toISOString();
            preference.expiration_date_to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        if (planId === 'CLASS_PAYMENT') {
            preference.notification_url = `${webhookUrl}/api/payments/webhook/${userId}`;
        }

        const response = await axios.post(
            `${mercadoPagoConfig.apiUrl}/checkout/preferences`, 
            preference,
            { headers }
        );

        return {
            preferenceId: response.data.id,
            initPoint: response.data.init_point,
            sandboxInitPoint: response.data.sandbox_init_point
        };
    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        throw error;
    }
};

/**
 * Obtener detalles de un pago en Mercado Pago
 */
export const getMercadoPagoPayment = async (paymentId: string, customAccessToken?: string) => {
    try {
        const headers = {
            'Authorization': `Bearer ${customAccessToken || mercadoPagoConfig.accessToken}`
        };
        const response = await axios.get(`${mercadoPagoConfig.apiUrl}/v1/payments/${paymentId}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error getting Mercado Pago payment:', error);
        throw error;
    }
};

/**
 * Obtener información de una preferencia
 */
export const getMercadoPagoPreference = async (preferenceId: string, customAccessToken?: string) => {
    try {
        const headers = {
            'Authorization': `Bearer ${customAccessToken || mercadoPagoConfig.accessToken}`
        };
        const response = await axios.get(`${mercadoPagoConfig.apiUrl}/checkout/preferences/${preferenceId}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error getting Mercado Pago preference:', error);
        throw error;
    }
};
