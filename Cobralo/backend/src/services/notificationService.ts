import { Student, User } from '@prisma/client';

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
            message = message.replace(/{days}/g, daysRemaining.toString());
        }

        return message;
    },

    /**
     * Mock sender for WhatsApp
     * In a real app, this would use Meta API or whatsapp-web.js
     */
    async sendWhatsApp(phone: string, message: string): Promise<boolean> {
        console.log(`[WA-MOCK] Sending to ${phone}: "${message}"`);
        // Simulate API call
        return true;
    },

    /**
     * Mock sender for Email
     * In a real app, this would use Nodemailer or Resend
     */
    async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
        console.log(`[EMAIL-MOCK] Sending to ${email}: Subject: ${subject} | Body: "${message}"`);
        return true;
    }
};
