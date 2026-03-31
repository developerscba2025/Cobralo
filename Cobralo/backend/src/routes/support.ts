import { Router } from 'express';
import { notificationService } from '../services/notificationService';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const supportEmail = 'developerscba2025@gmail.com';
        const formattedMessage = `
            Nuevo mensaje de soporte desde Cobralo:
            
            Nombre: ${name}
            Email: ${email}
            Asunto: ${subject}
            
            Mensaje:
            ${message}
        `;

        const sent = await notificationService.sendEmail(
            supportEmail,
            `Soporte Cobralo: ${subject}`,
            formattedMessage
        );

        if (sent) {
            res.status(200).json({ status: 'success', message: 'Mensaje enviado correctamente' });
        } else {
            console.error('El servicio de notificaciones devolvió false al enviar el email de soporte.');
            // Aún sin Resend configurado en local, consideramos que la intención se procesó (o devolver un error si es estricto)
            // Para desarrollo, podemos simular éxito o devolver 500 si queremos ser estrictos. 
            // Como es un envío de correo crítico, devolvemos success si estamos seguros de que lo capturamos, 
            // pero el API call a Resend falló en el service. Dejaremos un comentario.
            // En producción debería intentar de nuevo, por ahora devolvemos 500 para notificar al frontend.
            res.status(500).json({ error: 'Hubo un problema al enviar el mensaje. Intenta más tarde.' });
        }

    } catch (error) {
        console.error('Error in POST /api/support:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar el soporte' });
    }
});

export default router;
