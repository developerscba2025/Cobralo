
import { prisma } from '../db';

async function checkAllData() {
    console.log("Checking ALL users and students for corruption...");
    
    const users = await prisma.user.findMany();
    users.forEach((u: any) => {
        const fields = ['name', 'bizName', 'biography'];
        fields.forEach(f => {
            const val = (u as any)[f];
            if (val && val.includes('\uFFFD')) {
                console.log(`❌ User ID ${u.id} (${u.email}) has corrupted field '${f}': ${val}`);
            }
        });
    });

    const students = await prisma.student.findMany();
    students.forEach((s: any) => {
        const fields = ['name', 'service_name'];
        fields.forEach(f => {
            const val = (s as any)[f];
            if (val && val.includes('\uFFFD')) {
                console.log(`❌ Student ID ${s.id} has corrupted field '${f}': ${val}`);
            }
        });
    });
    
    console.log("Check finished.");
}

checkAllData().catch(console.error);
