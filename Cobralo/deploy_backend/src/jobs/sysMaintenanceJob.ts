import cron from 'node-cron';
import { prisma } from '../db';
import dayjs from 'dayjs';

export const initSysMaintenanceCron = () => {
    // Ejecutar todos los domingos a las 02:00 AM
    cron.schedule('0 2 * * 0', async () => {
        try {
            console.log('Iniciando limpieza de base de datos (Cron Job semanal)...');
            
            const sevenDaysAgo = dayjs().subtract(7, 'days').toDate();

            // 1. Limpiar notificaciones de más de 7 días (todas)
            const deletedNotifications = await prisma.notification.deleteMany({
                where: {
                    createdAt: { lt: sevenDaysAgo }
                }
            });

            // 2. Pasar a FREE usuarios con CANCEL_AT_PERIOD_END y expiry vencida
            // subscriptions is a one-to-one relation; use the Subscription table directly
            const cancelledSubs = await prisma.subscription.findMany({
                where: { status: 'CANCEL_AT_PERIOD_END' },
                select: { userId: true }
            });
            const cancelledUserIds = cancelledSubs.map(s => s.userId);

            const expiredUsers = await prisma.user.findMany({
                where: {
                    isPro: true,
                    subscriptionExpiry: { lt: new Date() },
                    id: { in: cancelledUserIds }
                }
            });

            for (const user of expiredUsers) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isPro: false, plan: 'FREE', subscriptionExpiry: null }
                });
                await prisma.subscription.update({
                    where: { userId: user.id },
                    data: { status: 'cancelled' }
                });
            }

            console.log(`Mantenimiento completado. Notificaciones borradas: ${deletedNotifications.count}. Suscripciones vencidas procesadas: ${expiredUsers.length}`);

        } catch (error) {
            console.error('Error en el cron job de mantenimiento:', error);
        }
    });
};
