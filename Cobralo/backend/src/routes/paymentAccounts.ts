import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/payment-accounts
router.get('/', async (req: AuthRequest, res) => {
    try {
        const accounts = await prisma.businessPaymentAccount.findMany({
            where: { ownerId: req.userId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener cuentas' });
    }
});

// POST /api/payment-accounts
router.post('/', async (req: AuthRequest, res) => {
    try {
        const { name, alias, isDefault } = req.body;
        
        if (!name || !alias) {
            return res.status(400).json({ error: 'Nombre y Alias son requeridos' });
        }

        // If this is default, or the first account, set as default and unset others
        const existingCount = await prisma.businessPaymentAccount.count({
            where: { ownerId: req.userId }
        });

        const shouldBeDefault = isDefault || existingCount === 0;

        if (shouldBeDefault) {
            await prisma.businessPaymentAccount.updateMany({
                where: { ownerId: req.userId },
                data: { isDefault: false }
            });
        }

        const account = await prisma.businessPaymentAccount.create({
            data: {
                name,
                alias,
                isDefault: shouldBeDefault,
                ownerId: req.userId!
            }
        });
        res.json(account);
    } catch (error) {
        console.error('Error creating payment account:', error);
        res.status(500).json({ error: 'Error al crear cuenta' });
    }
});

// PUT /api/payment-accounts/:id
router.put('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { name, alias, isDefault } = req.body;

        if (isDefault) {
            await prisma.businessPaymentAccount.updateMany({
                where: { ownerId: req.userId },
                data: { isDefault: false }
            });
        }

        const account = await prisma.businessPaymentAccount.update({
            where: { 
                id: Number(id),
                ownerId: req.userId 
            },
            data: {
                name,
                alias,
                isDefault
            }
        });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar cuenta' });
    }
});

// DELETE /api/payment-accounts/:id
router.delete('/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        
        // Find if this was default
        const account = await prisma.businessPaymentAccount.findUnique({
            where: { id: Number(id) }
        });

        await prisma.businessPaymentAccount.delete({
            where: { 
                id: Number(id),
                ownerId: req.userId 
            }
        });

        // If it was default, pick another one to be default
        if (account?.isDefault) {
            const nextAccount = await prisma.businessPaymentAccount.findFirst({
                where: { ownerId: req.userId }
            });
            if (nextAccount) {
                await prisma.businessPaymentAccount.update({
                    where: { id: nextAccount.id },
                    data: { isDefault: true }
                });
            }
        }

        res.json({ message: 'Cuenta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar cuenta' });
    }
});

export default router;
