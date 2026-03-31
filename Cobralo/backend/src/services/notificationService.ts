import { Student, User } from '@prisma/client';
import axios from 'axios';

export type NotificationType = 'UPCOMING' | 'OVERDUE';

/**
 * Service to handle notification logic
 */
export const notificationService = {
    /**
     * Formats a message based on a template and student/user data
     */
    formatMessage(template: string | null, student: Student, user: User, type: NotificationType): string {
        const defaultTemplates = {
            UPCOMING: "Hola {student_name}, te recordamos que tu cuota de {service} vence en {days} días. El monto es {amount}. ¡Saludos!",
            OVERDUE: "Hola {student_name}, tu pago de {service} por {amount} está vencido. Por favor, regulariza tu situación. ¡Gracias!"
        };

        let message = template || defaultTemplates[type];
        
        // Basic variable replacement
        message = message.replace(/{student_name}/g, student.name);
        message = message.replace(/{service}/g, student.service_name || "clases");
        message = message.replace(/{amount}/g, `${user.currency || '$'}${student.amount?.toString() || '0'}`);
        
        if (type === 'UPCOMING') {
            const daysRemaining = student.deadline_day ? (student.deadline_day - new Date().getDate()) : 3;
            message = message.replace(/{days}/g, Math.max(0, daysRemaining).toString());
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
