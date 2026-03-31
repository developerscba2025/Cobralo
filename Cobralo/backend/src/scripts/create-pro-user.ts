import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'pro@cobralo.com';
    const password = 'cobralo123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`🚀 Creando cuenta PRO para: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            isPro: true,
            plan: 'PRO',
            password: hashedPassword,
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Usuario Pro',
            bizName: 'Academia Pro',
            isPro: true,
            plan: 'PRO',
            businessCategory: 'Educación',
            biography: 'Cuenta de prueba con todas las funciones desbloqueadas.',
        },
    });

    console.log('✅ Cuenta PRO lista!');
    console.log('----------------------------');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('----------------------------');
}

main()
    .catch((e) => {
        console.error('❌ Error creand cuenta:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
