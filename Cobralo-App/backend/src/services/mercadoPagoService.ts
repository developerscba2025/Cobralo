/**
 * Configuración de Mercado Pago
 */

import axios from 'axios';

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
 * Planes de suscripción disponibles (LANZAMIENTO - 50% OFF)
 */
export const SUBSCRIPTION_PLANS = {
    PRO_MONTHLY: {
        id: 'pro-monthly',
        name: 'Plan Pro - Mensual',
        description: 'Alumnos ilimitados, recordatorios WhatsApp y más',
        price: 6749, // ARS 6749.00 (25% OFF - Original 8999)
        currency: 'ARS',
        billingCycle: 'month',
        durationMonths: 1
    },
    PRO_TRIMESTRAL: {
        id: 'pro-trimestral',
        name: 'Plan Pro - Trimestral',
        description: 'Suscripción por 3 meses con descuento adicional',
        price: 18222, // ARS 18222.00
        currency: 'ARS',
        billingCycle: 'quarter',
        durationMonths: 3
    }
};

/**
 * Crear una preferencia de pago en Mercado Pago
 * @param customAccessToken Para cobrar a nombre del profesor
 */
export const createMercadoPagoPreference = async (
    userId: number,
    planId: keyof typeof SUBSCRIPTION_PLANS | 'CLASS_PAYMENT',
    returnUrl: string,
    customAccessToken?: string,
    classDetails?: { title: string; amount: number; studentId: number }
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
            external_reference = `student-${classDetails.studentId}-user-${userId}`;
            metadata = { student_id: classDetails.studentId, user_id: userId, type: 'class_payment' };
        } else {
            const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];
            items = [
                {
                    title: plan.name,
                    description: plan.description,
                    quantity: 1,
                    unit_price: plan.price,
                    currency_id: plan.currency
                }
            ];
            external_reference = `user-${userId}-${planId}`;
            metadata = { user_id: userId, plan_id: planId, type: 'subscription' };
        }

        const preference = {
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
            metadata,
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

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
export const getMercadoPagoPreference = async (preferenceId: string) => {
    try {
        const response = await mercadoPagoClient.get(`/checkout/preferences/${preferenceId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting Mercado Pago preference:', error);
        throw error;
    }
};
