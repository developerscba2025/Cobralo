import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'developerscba2025@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('--- User Found ---');
        console.log(`Email: ${user.email}`);
        console.log(`isAdmin: ${user.isAdmin}`);
        console.log(`isPro: ${user.isPro}`);
        console.log(`Plan: ${user.plan}`);
        console.log(`Expiry: ${user.subscriptionExpiry}`);
    } else {
        console.log('--- User Not Found ---');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
