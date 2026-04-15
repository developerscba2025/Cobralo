import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = 'cobralo123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Crear Cuenta BÁSICA
    const basicEmail = 'basica@cobralo.com';
    console.log(`🚀 Creando cuenta BÁSICA para: ${basicEmail}...`);
    await prisma.user.upsert({
        where: { email: basicEmail },
        update: {
            isPro: false,
            plan: 'FREE',
            password: hashedPassword,
        },
        create: {
            email: basicEmail,
            password: hashedPassword,
            name: 'Usuario Básico',
            bizName: 'Academia Básica',
            isPro: false,
            plan: 'FREE',
            businessCategory: 'Educación',
            biography: 'Cuenta con capacidades limitadas. Test para features básicos.',
        },
    });

    // 2. Crear Cuenta PREMIUM (PRO)
    const proEmail = 'premium@cobralo.com';
    console.log(`🚀 Creando cuenta PREMIUM para: ${proEmail}...`);
    await prisma.user.upsert({
        where: { email: proEmail },
        update: {
            isPro: true,
            plan: 'PRO',
            password: hashedPassword,
        },
        create: {
            email: proEmail,
            password: hashedPassword,
            name: 'Usuario Premium',
            bizName: 'Academia Premium',
            isPro: true,
            plan: 'PRO',
            businessCategory: 'Educación',
            biography: 'Cuenta PRO con todas las funciones desbloqueadas.',
        },
    });

    console.log('\n✅ ¡Cuentas listas!');
    console.log('----------------------------------------------------');
    console.log('🟣 CUENTA BÁSICA');
    console.log(`   Email: ${basicEmail}`);
    console.log(`   Password: ${password}`);
    console.log('\n🟢 CUENTA PREMIUM (PRO)');
    console.log(`   Email: ${proEmail}`);
    console.log(`   Password: ${password}`);
    console.log('----------------------------------------------------');
}

main()
    .catch((e) => {
        console.error('❌ Error creando cuentas:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
