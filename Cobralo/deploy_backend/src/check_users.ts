import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      plan: true,
      isPro: true,
    },
  });

  console.log('--- Cobralo User Accounts ---');
  console.log('PRO Accounts:');
  console.log(users.filter(u => u.isPro || u.plan === 'PRO').map(u => `  - ${u.email} (${u.plan})`));
  console.log('\nFREE Accounts:');
  console.log(users.filter(u => !u.isPro && u.plan !== 'PRO').map(u => `  - ${u.email} (${u.plan})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
