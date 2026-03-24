const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'admin@cobralo.app' },
    data: { isPro: true, plan: 'PRO' }
  });
  console.log('User restored to PRO:', user.email);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
