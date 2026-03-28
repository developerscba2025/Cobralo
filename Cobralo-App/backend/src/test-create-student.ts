import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('--- STUDENT CREATION TEST ---');
        console.log('DATABASE_URL:', process.env.DATABASE_URL);

        // Try to find a user first
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No user found to be owner!');
            return;
        }
        console.log('Using ownerId:', user.id);

        const payload = {
            ownerId: user.id,
            name: 'Test Student ' + Date.now(),
            phone: '123456789',
            service_name: 'Piano',
            price_per_hour: 1000,
            class_duration_min: 60,
            classes_per_month: 4,
            amount: 4000,
            payment_method: 'Mercado Pago',
            surcharge_percentage: 10,
            deadline_day: 10,
            due_day: 1,
            status: 'pending'
        };

        console.log('Creating student with payload:', payload);
        const student = await prisma.student.create({
            data: payload
        });
        console.log('SUCCESS! Student created:', student);

    } catch (error) {
        console.error('CREATION FAILED:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
