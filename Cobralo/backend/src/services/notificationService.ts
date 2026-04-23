import { prisma } from '../db';
import axios from 'axios';

// Use inline types to avoid build failures when `prisma generate` hasn't run yet
type Student = {
    id: number;
    name: string | null;
    service_name: string | null;
    amount: any;
    due_day?: number | null;
    deadline_day?: number | null;
    [key: string]: any;
};

type User = {
    id: number;
    name: string | null;
    bizName?: string | null;
    currency?: string | null;
    [key: string]: any;
};

export type NotificationType = 'UPCOMING' | 'OVERDUE' | 'CLASS_REMINDER' | 'PAYMENT_RECEIVED' | 'PRO_REMINDER_SENT';

/**
 * Service to handle notification logic
 */
export const notificationService = {
    formatMessage(template: string | null, student: Student, user: any, type: NotificationType, extraData?: any): string {
        const defaultTemplates = {
            UPCOMING: "! RECORDATORIO DE PAGO !\n------------------------\nHola *{nombre}* \u00BB\n\nTe escribimos de *{negocio}*.\nTu cuota está por vencer.\n\n[ RESUMEN DE CUENTA ]\n\u00B7 Servicio: {servicio}\n\u00B7 Vencimiento: Día {vencimiento}\n\u00B7 Monto: {monto}\n\nPara abonar de forma segura:\n\u00BB {pago_url}\n\nQue tengas un excelente día \u00B7",
            OVERDUE: "! AVISO DE DEUDA !\n------------------------\nHola *{nombre}*,\n\nTe enviamos este aviso desde *{negocio}* por un pago pendiente.\n\n[ DETALLE ]\n\u00B7 Servicio: {servicio}\n\u00B7 Total pendiente: {monto}\n\nSi ya pagaste, carga el comprobante aquí:\n\u00BB {pago_url}\n\nQuedamos a tu disposición \u00B7",
            CLASS_REMINDER: "! RECORDATORIO DE CLASE !\n------------------------\nHola *{nombre}*, confirmamos tu turno en *{negocio}*.\n\n[ HORARIO ] \u00B7 {hora_inicio}\n[ SERVICIO ] \u00B7 {servicio}\n\nConfirmá tu asistencia:\n[ SI ] \u00BB {url_confirmar}\n[ NO ] \u00BB {url_cancelar}\n\nTe esperamos \u00B7",
            PRO_REMINDER_SENT: "Recordatorio PRO enviado a {alumno} ({monto})",
            PAYMENT_RECEIVED: "! PAGO RECIBIDO !\n------------------------\nHola *{nombre}*. Tu pago ha sido acreditado exitosamente.\n\n```\nCOMPROBANTE DIGITAL\n------------------\n\u00B7 Servicio: {servicio}\n\u00B7 Monto: {monto}\n\u00B7 Estado: Al día\n```\n\nGracias por confiar en *{negocio}* \u00BB"
        };

        const message = template || (defaultTemplates as any)[type];
        return this.replaceVariables(message, student, user, extraData);
    },

    /**
     * Replaces all supported variables and normalizes the string for WhatsApp
     */
    replaceVariables(text: string, student: Student, user: any, extraData?: any): string {
        const bizName = user.bizName || user.name || "Tu Profe";
        const currency = user.currency || '$';
        const amountNum = Number(student.amount) || 0;
        const formattedAmount = `${currency}${amountNum.toLocaleString('es-AR')}`;
        
        const hour = new Date().getHours();
        const saludo = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
        
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        const mesActual = meses[new Date().getMonth()];
        const nombrePila = student.name ? student.name.split(' ')[0] : '';
        
        const appBaseUrl = process.env.APP_BASE_URL || 'https://cobralo.info';
        const pagoUrl = extraData?.paymentLink || `${appBaseUrl}/pago/${student.id}`;

        let message = text
            // Nuevas variables (Preferidas)
            .replace(/{alumno}/g, student.name || "")
            .replace(/{nombre}/g, nombrePila)
            .replace(/{monto}/g, formattedAmount)
            .replace(/{servicio}/g, student.service_name || "clases")
            .replace(/{negocio}/g, bizName)
            .replace(/{pago_url}/g, pagoUrl)
            .replace(/{vencimiento}/g, (student.due_day || student.deadline_day || '').toString())
            .replace(/{mes}/g, mesActual)
            .replace(/{saludo}/g, saludo)
            
            // Variables de eventos
            .replace(/{hora_inicio}/g, extraData?.start_time || '')
            .replace(/{start_time}/g, extraData?.start_time || '')
            .replace(/{url_confirmar}/g, extraData?.confirmUrl || '')
            .replace(/{confirm_url}/g, extraData?.confirmUrl || '')
            .replace(/{url_cancelar}/g, extraData?.cancelUrl || '')
            .replace(/{cancel_url}/g, extraData?.cancelUrl || '')
            .replace(/{dias}/g, extraData?.daysRemaining?.toString() || '')

            // Alias heredados
            .replace(/{student_name}/g, student.name || "")
            .replace(/{nombre_pila}/g, nombrePila)
            .replace(/{mes_actual}/g, mesActual)
            .replace(/{amount}/g, formattedAmount)
            .replace(/{service}/g, student.service_name || "clases")
            .replace(/{moneda}/g, currency);

        // NORMALIZE: Ensure characters are standard UTF-8 and strip only C0 control chars.
        // We preserve emojis and all Unicode characters.
        return message.normalize('NFC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
    },

    /**
     * Real sender for WhatsApp using Meta Cloud API
     */
    async sendWhatsApp(phone: string, message: string): Promise<boolean> {
        const token = process.env.WHATSAPP_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'notificacion_general';

        if (!token || !phoneId || token === 'your_meta_cloud_token_here') {
            const errorMsg = 'Integración de WhatsApp omitida: Faltan credenciales en .env';
            console.warn(`⚠️ ${errorMsg}`);
            return false;
        }

        try {
            const cleanPhone = phone.replace(/\D/g, '');
            
            // Note: Meta Cloud API requires 'template' for the first message to a user.
            // If the user already replied, 'text' can be used.
            // We use 'template' by default as configured in the system.
            const payload = {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "es_AR" },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: message }
                            ]
                        }
                    ]
                }
            };

            await axios.post(
                `https://graph.facebook.com/v17.0/${phoneId}/messages`,
                payload,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log(`✅ WhatsApp enviado a ${cleanPhone} usando template ${templateName}`);
            return true;
        } catch (error: any) {
            console.error('❌ Error sending WhatsApp:', error.response?.data || error.message);
            throw new Error(`Error al enviar WhatsApp: ${error.response?.data?.error?.message || error.message}`);
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
