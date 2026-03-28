import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Directory Data...');

  const hashedPassword = await bcrypt.hash('cobralo123', 10);

  // 1. Create a Pro Teacher: Yoga
  const yogaTeacher = await prisma.user.upsert({
    where: { email: 'yoga@example.com' },
    update: {},
    create: {
      email: 'yoga@example.com',
      password: hashedPassword,
      name: 'Sofía Rodriguez',
      bizName: 'Namaste Yoga Studio',
      isPro: true,
      plan: 'PRO',
      businessCategory: 'Yoga & Bienestar',
      bio: 'Instructora certificada con más de 10 años de experiencia en Hatha y Vinyasa.',
      city: 'CABA',
      tags: 'Salud,Bienestar,Yoga',
    },
  });

  // Add Ratings for Yoga
  await prisma.rating.createMany({
    data: [
      { ownerId: yogaTeacher.id, value: 5, comment: 'Paz absoluta en cada clase.', studentName: 'Marcela G.' },
      { ownerId: yogaTeacher.id, value: 5, comment: 'La mejor profe de la zona.', studentName: 'Juan P.' },
    ]
  });

  // 2. Create a Pro Teacher: Music
  const musicTeacher = await prisma.user.upsert({
    where: { email: 'guitarra@example.com' },
    update: {},
    create: {
      email: 'guitarra@example.com',
      password: hashedPassword,
      name: 'Lucas Ferrero',
      bizName: 'Acordes Online',
      isPro: true,
      plan: 'PRO',
      businessCategory: 'Clases de Música',
      bio: 'Músico profesional. Clases personalizadas de guitarra criolla y eléctrica.',
      city: 'Córdoba',
      tags: 'Arte,Educación,Música',
    },
  });

  await prisma.rating.createMany({
    data: [
      { ownerId: musicTeacher.id, value: 5, comment: 'Sus métodos de enseñanza son súper claros.', studentName: 'Enzo S.' },
      { ownerId: musicTeacher.id, value: 4, comment: 'Excelente técnica.', studentName: 'Lucía B.' },
    ]
  });

  // 3. Create a Pro Teacher: Tech
  const techTeacher = await prisma.user.upsert({
    where: { email: 'tecnico@example.com' },
    update: {},
    create: {
      email: 'tecnico@example.com',
      password: hashedPassword,
      name: 'Roberto Sanchez',
      bizName: 'Sanchez Tech Soluciones',
      isPro: true,
      plan: 'PRO',
      businessCategory: 'Servicios de Consultoría',
      bio: 'Soporte técnico integral y armado de PCs de alto rendimiento.',
      city: 'Rosario',
      tags: 'Tecnología,Hardware,PC',
    },
  });

  await prisma.rating.createMany({
    data: [
      { ownerId: techTeacher.id, value: 5, comment: 'Rápido y honesto. Lo recomiendo.', studentName: 'Carlos M.' },
    ]
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
