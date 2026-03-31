import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding System Settings...');

  const settings = [
    { key: 'ipc_multiplier', value: '1.0', type: 'number' },
    { key: 'last_ipc_update', value: new Date().toISOString(), type: 'string' },
    { key: 'base_price_initial', value: '6990', type: 'number' },
    { key: 'base_price_pro', value: '14990', type: 'number' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ System Settings seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
