/**
 * Script para limpiar templates corruptos de la DB.
 * Ejecutar con: npx tsx scripts/cleanTemplates.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTemplates() {
    console.log('Iniciando limpieza de templates...');

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { welcomeTemplate: { not: null } },
                { reminderTemplate: { not: null } },
                { generalTemplate: { not: null } },
                { classReminderTemplate: { not: null } },
            ]
        },
        select: {
            id: true,
            email: true,
            welcomeTemplate: true,
            reminderTemplate: true,
            generalTemplate: true,
            classReminderTemplate: true,
        }
    });

    console.log(`Encontrados ${users.length} usuarios con templates guardados.`);

    let cleaned = 0;
    for (const user of users) {
        // Check if any template contains replacement characters (corrupted data)
        const hasCorruption = [
            user.welcomeTemplate,
            user.reminderTemplate,
            user.generalTemplate,
            user.classReminderTemplate
        ].some(t => t && t.includes('\uFFFD'));

        if (hasCorruption) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    welcomeTemplate: null,
                    reminderTemplate: null,
                    generalTemplate: null,
                    classReminderTemplate: null,
                }
            });
            console.log(`  ✅ Limpiado: ${user.email}`);
            cleaned++;
        } else {
            console.log(`  ℹ️  Sin corrupción: ${user.email}`);
        }
    }

    console.log(`\nLimpieza completada. ${cleaned} usuario(s) limpiados.`);
    await prisma.$disconnect();
}

cleanTemplates().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
