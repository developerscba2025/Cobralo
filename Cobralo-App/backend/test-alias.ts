import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAlias() {
    try {
        console.log('Testing Student Alias...');
        
        // Find a user
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error('No user found to test with');
            return;
        }

        // Create a student with an alias
        const student = await prisma.student.create({
            data: {
                ownerId: user.id,
                name: 'Test Student Alias',
                phone: '5491112345678',
                service_name: 'Test Service',
                amount: 1000,
                billing_alias: 'custom.test.alias'
            }
        });

        console.log('Student created:', {
            id: student.id,
            name: student.name,
            billing_alias: student.billing_alias
        });

        if (student.billing_alias === 'custom.test.alias') {
            console.log('✅ Success: Billing alias saved correctly');
        } else {
            console.error('❌ Error: Billing alias not saved correctly');
        }

        // Cleanup
        await prisma.student.delete({ where: { id: student.id } });
        console.log('Cleaned up test student');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAlias();
