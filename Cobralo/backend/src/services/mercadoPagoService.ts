/**
 * Configuración de Mercado Pago
 */

import axios from 'axios';

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const MERCADO_PAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || '';

export const mercadoPagoConfig = {
    accessToken: MERCADO_PAGO_ACCESS_TOKEN,
    publicKey: MERCADO_PAGO_PUBLIC_KEY,
    apiUrl: 'https://api.mercadopago.com'
};

/**
 * Cliente HTTP para Mercado Pago
 */
export const mercadoPagoClient = axios.create({
    baseURL: mercadoPagoConfig.apiUrl,
    timeout: 10000, // 10 second timeout
    headers: {
        'Authorization': `Bearer ${mercadoPagoConfig.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Planes de suscripción disponibles
 */
export const SUBSCRIPTION_PLANS = {
    PRO_MONTHLY: {
        id: 'pro-monthly',
        name: 'Plan Pro - Mensual',
        description: 'Acceso ilimitado a todas las funcionalidades Pro',
        price: 999, // ARS 9.99 por mes (se ajusta según económia)
        currency: 'ARS',
        billingCycle: 'month',
        durationMonths: 1
    },
    PRO_ANNUAL: {
        id: 'pro-annual',
        name: 'Plan Pro - Anual',
        description: 'Acceso ilimitado a todas las funcionalidades Pro por un año',
        price: 9999, // ARS 99.99 por año (20% descuento)
        currency: 'ARS',
        billingCycle: 'year',
        durationMonths: 12
    }
};

/**
 * Crear una preferencia de pago en Mercado Pago
 */
export const createMercadoPagoPreference = async (
    userId: number,
    planId: keyof typeof SUBSCRIPTION_PLANS,
    returnUrl: string
) => {
    try {
        const plan = SUBSCRIPTION_PLANS[planId];

        const preference = {
            items: [
                {
                    title: plan.name,
                    description: plan.description,
                    quantity: 1,
                    unit_price: plan.price / 100, // Convertir centavos a pesos
                    currency_id: plan.currency
                }
            ],
            payer: {
                email: `user-${userId}@cobralo.app`
            },
            back_urls: {
                success: `${returnUrl}?status=success`,
                failure: `${returnUrl}?status=failure`,
                pending: `${returnUrl}?status=pending`
            },
            statement_descriptor: 'COBRALO PRO',
            external_reference: `user-${userId}-${planId}`,
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        const response = await mercadoPagoClient.post('/checkout/preferences', preference);

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
export const getMercadoPagoPayment = async (paymentId: string) => {
    try {
        const response = await mercadoPagoClient.get(`/v1/payments/${paymentId}`);
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
