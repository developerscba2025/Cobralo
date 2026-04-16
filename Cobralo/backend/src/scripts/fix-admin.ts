import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'developerscba2025@gmail.com';
    
    console.log(`--- Fixing account for ${email} ---`);
    
    const user = await prisma.user.update({
        where: { email },
        data: {
            isAdmin: true,
            isPro: true,
            plan: 'PRO',
            subscriptionExpiry: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000), // 10 years
        },
    });

    console.log('✅ Account Updated Successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`isAdmin: ${user.isAdmin}`);
    console.log(`isPro: ${user.isPro}`);
    console.log(`Plan: ${user.plan}`);
    console.log(`Expiry: ${user.subscriptionExpiry}`);
}

main()
    .catch(async (error) => {
        console.error('❌ Error updating account:', error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
