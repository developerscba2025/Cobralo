import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'developerscba2025@gmail.com';
    const password = 'AdminPassword123!'; // Known password for local testing
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('--- Seeding Admin User ---');

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            plan: 'PRO',
            isPro: true,
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Super Admin',
            bizName: 'Cobralo HQ',
            plan: 'PRO',
            isPro: true,
            subscriptionExpiry: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000), // 10 years
        },
    });

    console.log(`✅ Admin user ${admin.email} is ready.`);

    // Also seed a test user to update
    const testEmail = 'testuser@cobralo.com';
    await prisma.user.upsert({
        where: { email: testEmail },
        update: {},
        create: {
            email: testEmail,
            password: hashedPassword,
            name: 'Test User',
            plan: 'FREE',
            isPro: false,
        },
    });

    console.log(`✅ Test user ${testEmail} created.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
