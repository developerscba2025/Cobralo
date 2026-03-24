const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'admin@cobralo.app' },
    data: { isPro: false, plan: 'FREE' }
  });
  console.log('User updated to FREE:', user.email);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
