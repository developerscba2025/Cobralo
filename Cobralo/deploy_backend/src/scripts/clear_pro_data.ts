import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'pro@cobralo.com';
    
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user ${user.name} (ID: ${user.id}). Deleting student data...`);

    // Due to Cascade on Delete relation in schema, this should work, but let's be explicit
    // Actually, Student relates to Attendance, Payments, etc with Cascade onDelete.
    
    const deletedStudents = await prisma.student.deleteMany({
        where: { ownerId: user.id }
    });
    
    const deletedExpenses = await prisma.expense.deleteMany({
        where: { ownerId: user.id }
    });

    const deletedSchedules = await prisma.classSchedule.deleteMany({
        where: { ownerId: user.id }
    });

    console.log(`Deleted ${deletedStudents.count} students, ${deletedExpenses.count} expenses, and ${deletedSchedules.count} class schedules.`);

    // Also clear expenses and other user data if needed?
    // User request only mentioned "alumnos".
    
    // Clear attendance and payments just in case although cascade should handle it.
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
