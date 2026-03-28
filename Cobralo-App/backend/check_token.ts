import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkToken() {
  const token = 'e6bbec53c96b0ef54f76c22ec68d8795';
  const user = await prisma.user.findFirst({
    where: { ratingToken: token }
  });
  
  if (user) {
    console.log('USER_FOUND:', JSON.stringify({
      id: user.id,
      email: user.email,
      ratingToken: user.ratingToken,
      ratingTokenExpires: user.ratingTokenExpires
    }));
  } else {
    console.log('USER_NOT_FOUND');
  }
}

checkToken().finally(() => prisma.$disconnect());
