import { Student, User } from '@prisma/client';
import axios from 'axios';

export type NotificationType = 'UPCOMING' | 'OVERDUE' | 'CLASS_REMINDER' | 'PAYMENT_RECEIVED' | 'PRO_REMINDER_SENT';

/**
 * Service to handle notification logic
 */
export const notificationService = {
    /**
     * Formats a message based on a template and student/user data
     */
    formatMessage(template: string | null, student: Student, user: any, type: NotificationType, extraData?: any): string {
        const defaultTemplates = {
            UPCOMING: "👋 Hola *{alumno}*,\n\nTe escribimos de *{negocio}* para recordarte que tu cuota de *{servicio}* vence pronto.\n\n📌 *Detalles:*\n💰 *Monto:* {monto}\n⏳ *Días restantes:* {dias}\n\n✅ Podés realizar tu pago de forma segura aquí:\n🔗 {pago_url}\n\n¡Muchas gracias!",
            OVERDUE: "⚠️ Hola *{alumno}*,\n\nTe enviamos este recordatorio de *{negocio}* ya que tenés un pago pendiente de *{servicio}*.\n\n📌 *Detalles:*\n💵 *Monto:* {monto}\n\n✅ Si ya realizaste el pago, podés cargar el comprobante aquí:\n🔗 {pago_url}\n\nSi tenés alguna duda, estamos a tu disposición.\n¡Gracias!",
            CLASS_REMINDER: "📅 *Recordatorio de Clase*\n\nHola *{alumno}*, te recordamos que tenemos clase hoy:\n⏰ *Hora:* {hora_inicio}\n🏢 *Servicio:* {servicio}\n\nPor favor, confirmá tu asistencia aquí:\n✅ Confirmar: {url_confirmar}\n❌ Cancelar: {url_cancelar}\n\n¡Te esperamos!",
            PRO_REMINDER_SENT: "✅ Recordatorio PRO enviado a {alumno}. Vence en 2 días ({monto}).",
            PAYMENT_RECEIVED: "✅ *¡Pago Recibido!*\n\nHola *{alumno}*, recibimos correctamente tu pago de *{monto}* por *{servicio}*.\n\n¡Muchísimas gracias por tu confianza en *{negocio}*!"
        };

        let message = template || defaultTemplates[type];
        
        const bizName = user.bizName || user.name || "Tu Profe";
        const currency = user.currency || '$';
        const amount = `${currency}${student.amount?.toString() || '0'}`;
        const appBaseUrl = process.env.APP_BASE_URL || 'https://cobraloapp.com';
        const pagoUrl = extraData?.paymentLink || `${appBaseUrl}/pago/${student.id}`;

        // Basic variable replacement
        message = message.replace(/{student_name}/g, student.name).replace(/{alumno}/g, student.name);
        message = message.replace(/{service}/g, student.service_name || "clases").replace(/{servicio}/g, student.service_name || "clases");
        message = message.replace(/{amount}/g, amount).replace(/{monto}/g, amount);
        message = message.replace(/{negocio}/g, bizName);
        message = message.replace(/{pago_url}/g, pagoUrl);
        
        if (extraData?.start_time) {
            message = message.replace(/{start_time}/g, extraData.start_time).replace(/{hora_inicio}/g, extraData.start_time);
        }
        
        if (extraData?.confirmUrl) {
            message = message.replace(/{confirm_url}/g, extraData.confirmUrl).replace(/{url_confirmar}/g, extraData.confirmUrl);
            message = message.replace(/{cancel_url}/g, extraData.cancelUrl || '').replace(/{url_cancelar}/g, extraData.cancelUrl || '');
        }

        if (type === 'UPCOMING') {
            const daysRemaining = student.deadline_day ? (student.deadline_day - new Date().getDate()) : 3;
            const days = Math.max(0, daysRemaining).toString();
            message = message.replace(/{days}/g, days).replace(/{dias}/g, days);
        }

        return message;
    },

    /**
     * Real sender for WhatsApp using Meta Cloud API
     */
    async sendWhatsApp(phone: string, message: string): Promise<boolean> {
        const token = process.env.WHATSAPP_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId || token === 'your_meta_cloud_token_here') {
            console.warn('⚠️ WhatsApp integration skipped: Missing credentials in .env');
            return false;
        }

        try {
            // Clean phone number (strip + and spaces)
            const cleanPhone = phone.replace(/\D/g, '');
            
            await axios.post(
                `https://graph.facebook.com/v17.0/${phoneId}/messages`,
                {
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: "text",
                    text: { body: message }
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            console.log(`✅ WhatsApp sent to ${cleanPhone}`);
            return true;
        } catch (error: any) {
            console.error('❌ Error sending WhatsApp:', error.response?.data || error.message);
            return false;
        }
    },

    /**
     * Real sender for Email using Resend API
     */
    async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
        const resendKey = process.env.RESEND_API_KEY;

        if (!resendKey || resendKey === 're_your_api_key_here') {
            console.warn('⚠️ Email integration skipped: Missing RESEND_API_KEY in .env');
            return false;
        }

        try {
            // Resend requires verified domains. 'onboarding@resend.dev' works out-of-the-box for testing if you send to your own registered email.
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'Cobralo <onboarding@resend.dev>';
            
            await axios.post(
                'https://api.resend.com/emails',
                {
                    from: fromEmail,
                    to: [email],
                    subject: subject,
                    html: `<div style="font-family: sans-serif; line-height: 1.5;">${message.replace(/\n/g, '<br>')}</div>`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`✅ Email sent to ${email}`);
            return true;
        } catch (error: any) {
            const apiError = error.response?.data;
            console.error('❌ Error sending Email:', apiError ? JSON.stringify(apiError, null, 2) : error.message);
            return false;
        }
    }
};
