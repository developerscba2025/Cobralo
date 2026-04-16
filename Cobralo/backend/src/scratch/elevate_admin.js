const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.update({
      where: { email: 'developerscba2025@gmail.com' },
      data: { isAdmin: true }
    });
    console.log('Usuario actualizado:', user.email, 'isAdmin:', user.isAdmin);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
