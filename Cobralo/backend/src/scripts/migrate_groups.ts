import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('🚀 Iniciando migración de Grupos...');

    try {
        // 1. Obtener todos los schedules que tienen más de 1 alumno 
        // o que comparten startTime + title en el mismo día
        const allSchedules = await prisma.classSchedule.findMany({
            where: { groupId: null },
            include: {
                students: { select: { id: true, name: true, service_name: true } },
                student: { select: { id: true, name: true, service_name: true } }
            }
        });

        console.log(`🔍 Analizando ${allSchedules.length} horarios sin grupo...`);

        // Agrupar por una clave única de "identidad de grupo potencial"
        // Clave: title (o service_name) + startTime + dayOfWeek (opcional, pero mejor agrupar todos los días del mismo servicio)
        const potentialGroups: Record<string, typeof allSchedules> = {};

        allSchedules.forEach((s: any) => {
            const serviceName = s.students?.[0]?.service_name || s.student?.service_name || 'Clase';
            const groupName = s.title || serviceName;
            
            // Si tiene más de 1 alumno, es casi seguro que es un grupo
            const isLikelyGroup = (s.students?.length || 0) > 1 || s.title;

            if (isLikelyGroup) {
                const key = groupName.trim().toLowerCase();
                if (!potentialGroups[key]) potentialGroups[key] = [];
                potentialGroups[key].push(s);
            }
        });

        let groupsCreated = 0;
        let schedulesLinked = 0;

        for (const [name, schedules] of Object.entries(potentialGroups)) {
            // Unificamos alumnos de todos los horarios que coinciden en nombre
            const allStudentIds = new Set<number>();
            schedules.forEach((s: any) => {
                if (s.studentId) allStudentIds.add(s.studentId);
                s.students?.forEach((st: any) => allStudentIds.add(st.id));
            });

            if (allStudentIds.size === 0) continue;

            const ownerId = schedules[0].ownerId;
            const originalName = schedules[0].title || schedules[0].student?.service_name || 'Nuevo Grupo';

            // Crear el Grupo
            const group = await prisma.group.create({
                data: {
                    name: originalName,
                    ownerId: ownerId,
                    capacity: Math.max(...schedules.map((s: any) => s.capacity || 10), allStudentIds.size),
                    students: {
                        connect: Array.from(allStudentIds).map(id => ({ id }))
                    }
                }
            });

            // Vincular los schedules
            const scheduleIds = schedules.map((s: any) => s.id);
            await prisma.classSchedule.updateMany({
                where: { id: { in: scheduleIds } },
                data: { groupId: group.id }
            });

            groupsCreated++;
            schedulesLinked += scheduleIds.length;
            console.log(`✅ Grupo creado: "${originalName}" con ${allStudentIds.size} alumnos y ${scheduleIds.length} horarios.`);
        }

        console.log('\n--- RESUMEN ---');
        console.log(`Grupos creados: ${groupsCreated}`);
        console.log(`Horarios vinculados: ${schedulesLinked}`);
        console.log('---------------');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
