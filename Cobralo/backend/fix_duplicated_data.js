const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicatedData() {
    console.log('--- Starting Data Correction Script ---');
    try {
        const students = await prisma.student.findMany();
        console.log(`Analyzing ${students.length} students...`);

        let fixedCount = 0;

        for (const student of students) {
            let needsUpdate = false;
            const updates = {};

            const fieldsToFix = ['name', 'phone', 'service_name'];

            for (const field of fieldsToFix) {
                const value = student[field];
                if (!value || typeof value !== 'string') continue;

                // Check for exact duplication (ABCDABCD)
                if (value.length > 0 && value.length % 2 === 0) {
                    const half = value.length / 2;
                    const firstHalf = value.substring(0, half);
                    const secondHalf = value.substring(half);

                    if (firstHalf === secondHalf) {
                        console.log(`[FIX] Duplication detected in ${field} for student ID ${student.id}: "${value}" -> "${firstHalf}"`);
                        updates[field] = firstHalf;
                        needsUpdate = true;
                    }
                }
            }

            if (needsUpdate) {
                await prisma.student.update({
                    where: { id: student.id },
                    data: updates
                });
                fixedCount++;
            }
        }

        console.log(`--- Finished! Fixed ${fixedCount} records. ---`);
    } catch (error) {
        console.error('Error during data correction:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDuplicatedData();
