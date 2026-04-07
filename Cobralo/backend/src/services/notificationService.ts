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
            UPCOMING: "Hola {alumno}, te recordamos que tu cuota de {servicio} vence en {dias} días. El monto es {monto}. ¡Saludos!",
            OVERDUE: "Hola {alumno}, te escribo para recordarte que tenés pendiente el pago de {servicio} por {monto}. Avisame cualquier cosa. ¡Gracias!",
            CLASS_REMINDER: "Hola {alumno}, te recuerdo que tenemos clase a las {hora_inicio}. Por favor, confirmame acá si venís: {url_confirmar}\n\nSi se te complica y necesitás cancelar, usá este enlace: {url_cancelar}. ¡Nos vemos!",
            PRO_REMINDER_SENT: "✅ Recordatorio PRO enviado a {alumno}. Vence en 2 días ({monto}).",
            PAYMENT_RECEIVED: "✅ ¡Pago recibido! Hola {alumno}, recibimos tu pago de {monto}. ¡Gracias!"
        };

        let message = template || defaultTemplates[type];
        
        // Basic variable replacement (Supporting both EN and ES tags for backwards compatibility initially, but replacing ES)
        message = message.replace(/{student_name}/g, student.name).replace(/{alumno}/g, student.name);
        message = message.replace(/{service}/g, student.service_name || "clases").replace(/{servicio}/g, student.service_name || "clases");
        message = message.replace(/{amount}/g, `${user.currency || '$'}${student.amount?.toString() || '0'}`).replace(/{monto}/g, `${user.currency || '$'}${student.amount?.toString() || '0'}`);
        
        if (extraData?.start_time) {
            message = message.replace(/{start_time}/g, extraData.start_time).replace(/{hora_inicio}/g, extraData.start_time);
        }
        
        if (extraData?.confirmUrl) {
            message = message.replace(/{confirm_url}/g, extraData.confirmUrl).replace(/{url_confirmar}/g, extraData.confirmUrl);
            message = message.replace(/{cancel_url}/g, extraData.cancelUrl || '').replace(/{url_cancelar}/g, extraData.cancelUrl || '');
            // Auto-append confirmation links if they're not already in the template
            if (!message.includes(extraData.confirmUrl)) {
                message += `\n\n✅ Confirmar asistencia: ${extraData.confirmUrl}\n❌ No voy a poder ir: ${extraData.cancelUrl}`;
            }
        }

        if (type === 'UPCOMING') {
            const daysRemaining = student.deadline_day ? (student.deadline_day - new Date().getDate()) : 3;
            message = message.replace(/{days}/g, Math.max(0, daysRemaining).toString()).replace(/{dias}/g, Math.max(0, daysRemaining).toString());
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
            console.error('❌ Error sending Email:', error.response?.data || error.message);
            return false;
        }
    }
};
