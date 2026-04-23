import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import crypto from 'crypto';

const router = Router();

// All admin routes require auth + admin
router.use(authMiddleware, requireAdmin);

/**
 * GET /api/admin/stats
 * Métricas globales del sistema
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalUsers,
            proUsers,
            basicUsers,
            initialUsers,
            freeUsers,
            totalStudents,
            totalPayments,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { plan: 'PRO' } }),
            prisma.user.count({ where: { plan: 'BASIC' } }),
            prisma.user.count({ where: { plan: 'INITIAL' } }),
            prisma.user.count({ where: { plan: 'FREE' } }),
            prisma.student.count(),
            prisma.paymentHistory.count(),
        ]);

        const recentUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, name: true, email: true, plan: true, createdAt: true }
        });

        res.json({
            totalUsers,
            planBreakdown: { PRO: proUsers, BASIC: basicUsers, INITIAL: initialUsers, FREE: freeUsers },
            totalStudents,
            totalPayments,
            recentUsers
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

/**
 * GET /api/admin/users
 * Lista de usuarios con filtros y paginación
 * Query params: search, plan, page, limit
 */
router.get('/users', async (req: AuthRequest, res: Response) => {
    try {
        const { search, plan, page = '1', limit = '20' } = req.query as Record<string, string>;
        const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

        const where: any = {};

        if (search) {
            where.OR = [
                { email: { contains: String(search) } },
                { name: { contains: String(search) } },
                { bizName: { contains: String(search) } }
            ];
        }

        if (plan && plan !== 'ALL') {
            where.plan = String(plan);
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(String(limit)),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bizName: true,
                    plan: true,
                    isPro: true,
                    isAdmin: true,
                    subscriptionExpiry: true,
                    createdAt: true,
                    phoneNumber: true,
                    isFeatured: true,
                    testimonial: true,
                    _count: { select: { students: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            total,
            page: parseInt(String(page), 10),
            totalPages: Math.ceil(total / parseInt(String(limit), 10))
        });
    } catch (error) {
        console.error('Admin list users error:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * PATCH /api/admin/users/:id/plan
 * Cambia el plan de un usuario
 * Body: { plan: 'FREE' | 'INITIAL' | 'BASIC' | 'PRO', expiryDate?: string }
 */
router.patch('/users/:id/plan', async (req: AuthRequest, res: Response) => {
    try {
        const userId = parseInt(String(req.params.id), 10);
        const { plan, expiryDate } = req.body;

        const validPlans = ['FREE', 'INITIAL', 'BASIC', 'PRO'];
        if (!plan || !validPlans.includes(plan)) {
            res.status(400).json({ error: `Plan inválido. Opciones: ${validPlans.join(', ')}` });
            return;
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
        if (!targetUser) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        const isPro = plan === 'PRO';

        // Calculate expiry
        let finalExpiry: Date | null = null;
        if (expiryDate) {
            finalExpiry = new Date(expiryDate);
        } else {
            if (plan === 'PRO') finalExpiry = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000); // 10 años
            else if (plan === 'INITIAL') finalExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 días
            else if (plan === 'BASIC') finalExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
            // FREE → null (sin expiración)
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { plan, isPro, subscriptionExpiry: finalExpiry },
            select: { id: true, email: true, plan: true, isPro: true, subscriptionExpiry: true }
        });

        console.log(`[ADMIN] User ${req.userEmail} changed plan for ${targetUser.email} → ${plan}`);
        res.json({ message: `Plan actualizado a ${plan} exitosamente`, user: updated });
    } catch (error) {
        console.error('Admin update plan error:', error);
        res.status(500).json({ error: 'Error al actualizar plan' });
    }
});

/**
 * POST /api/admin/users/:id/regenerate-token
 * Regenera un token del usuario
 * Body: { token: 'calendarToken' | 'ratingToken' }
 */
router.post('/users/:id/regenerate-token', async (req: AuthRequest, res: Response) => {
    try {
        const userId = parseInt(String(req.params.id), 10);
        const { token } = req.body;

        if (!['calendarToken', 'ratingToken'].includes(token)) {
            res.status(400).json({ error: 'Token inválido. Opciones: calendarToken, ratingToken' });
            return;
        }

        const newToken = crypto.randomBytes(20).toString('hex');
        const data: any = {};

        if (token === 'calendarToken') {
            data.calendarToken = newToken;
        } else if (token === 'ratingToken') {
            data.ratingToken = newToken;
            data.ratingTokenExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, email: true, calendarToken: true, ratingToken: true }
        });

        console.log(`[ADMIN] User ${req.userEmail} regenerated ${token} for user ${userId}`);
        res.json({ message: `${token} regenerado exitosamente`, user: updated });
    } catch (error) {
        console.error('Admin regenerate token error:', error);
        res.status(500).json({ error: 'Error al regenerar token' });
    }
});

/**
 * POST /api/admin/users/pre-approve
 * Pre-aprueba un correo para que cuando se registre tenga plan PRO automáticamente
 */
router.post('/users/pre-approve', async (req: AuthRequest, res: Response) => {
    try {
        let { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Email requerido' });
            return;
        }
        email = email.toLowerCase().trim();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'El email ya está registrado o pre-aprobado' });
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                name: 'Pendiente de Registro',
                password: 'PRE_APPROVED_DUMMY_ACCOUNT',
                plan: 'PRO',
                isPro: true,
                subscriptionExpiry: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000) // 10 años
            }
        });

        console.log(`[ADMIN] User ${req.userEmail} pre-approved ${email}`);
        res.json({ message: `Correo ${email} pre-aprobado exitosamente`, user: newUser });
    } catch (error) {
        console.error('Admin pre-approve error:', error);
        res.status(500).json({ error: 'Error al pre-aprobar correo' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Elimina un usuario y todos sus datos
 */
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
    try {
        const userId = parseInt(String(req.params.id), 10);

        // No permitir eliminar al propio admin que está haciendo la request
        if (userId === req.userId) {
            res.status(400).json({ error: 'No podés eliminar tu propia cuenta desde el panel de admin' });
            return;
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
        if (!targetUser) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        await prisma.user.delete({ where: { id: userId } });

        console.log(`[ADMIN] User ${req.userEmail} DELETED user ${targetUser.email} (id: ${userId})`);
        res.json({ message: `Usuario ${targetUser.email} eliminado exitosamente` });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

/**
 * GET /api/admin/ratings
 * Lista todas las calificaciones de los estudiantes
 */
router.get('/ratings', async (req: AuthRequest, res: Response) => {
    try {
        const ratings = await prisma.rating.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: { name: true, bizName: true, email: true }
                }
            }
        });
        res.json(ratings);
    } catch (error) {
        console.error('Admin ratings error:', error);
        res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
});

/**
 * DELETE /api/admin/ratings/:id
 * Eliminar una calificación (Moderación)
 */
router.delete('/ratings/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.rating.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Calificación eliminada' });
    } catch (error) {
        console.error('Admin delete rating error:', error);
        res.status(500).json({ error: 'Error al eliminar calificación' });
    }
});

/**
 * POST /api/admin/users/feature
 * Marca un usuario como destacado para la landing page y opcionalmente añade un testimonio
 * Body: { targetEmail: string, isFeatured: boolean, testimonial?: string }
 */
router.post('/users/feature', async (req: AuthRequest, res: Response) => {
    try {
        let { targetEmail, isFeatured, testimonial } = req.body;
        if (!targetEmail) {
            res.status(400).json({ error: 'Email requerido' });
            return;
        }
        targetEmail = targetEmail.toLowerCase().trim();

        const targetUser = await prisma.user.findUnique({ where: { email: targetEmail }, select: { id: true, email: true } });
        if (!targetUser) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        const updated = await prisma.user.update({
            where: { id: targetUser.id },
            data: { 
                isFeatured: Boolean(isFeatured), 
                testimonial: testimonial || null 
            },
            select: { id: true, email: true, isFeatured: true, testimonial: true }
        });

        console.log(`[ADMIN] User ${req.userEmail} updated feature status for ${targetUser.email} → isFeatured: ${isFeatured}`);
        res.json({ message: `Estado destacado actualizado exitosamente`, user: updated });
    } catch (error) {
        console.error('Admin update feature status error:', error);
        res.status(500).json({ error: 'Error al actualizar estado destacado' });
    }
});

/**
 * GET /api/admin/prices
 * Obtiene los precios base de los planes desde SystemSettings
 */
router.get('/prices', async (req: AuthRequest, res: Response) => {
    try {
        const keys = ['base_price_basic_monthly', 'base_price_pro_monthly', 'base_price_pro_trimestral', 'ipc_multiplier'];
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });

        // Valores por defecto si no existen en DB
        const defaultPrices = {
            base_price_basic_monthly: '5242',
            base_price_pro_monthly: '11242',
            base_price_pro_trimestral: '30352',
            ipc_multiplier: '1.0'
        };

        const result: Record<string, string> = { ...defaultPrices };
        settings.forEach(s => {
            result[s.key] = s.value;
        });

        res.json(result);
    } catch (error) {
        console.error('Admin get prices error:', error);
        res.status(500).json({ error: 'Error al obtener precios base' });
    }
});

/**
 * PATCH /api/admin/prices
 * Actualiza los precios base de los planes en SystemSettings
 * Body: { base_price_basic_monthly, base_price_pro_monthly, base_price_pro_trimestral }
 */
router.patch('/prices', async (req: AuthRequest, res: Response) => {
    try {
        const { base_price_basic_monthly, base_price_pro_monthly, base_price_pro_trimestral } = req.body;

        const updates = [];
        
        if (base_price_basic_monthly !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: 'base_price_basic_monthly' },
                update: { value: String(base_price_basic_monthly) },
                create: { key: 'base_price_basic_monthly', value: String(base_price_basic_monthly), type: 'number' }
            }));
        }

        if (base_price_pro_monthly !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: 'base_price_pro_monthly' },
                update: { value: String(base_price_pro_monthly) },
                create: { key: 'base_price_pro_monthly', value: String(base_price_pro_monthly), type: 'number' }
            }));
        }

        if (base_price_pro_trimestral !== undefined) {
            updates.push(prisma.systemSetting.upsert({
                where: { key: 'base_price_pro_trimestral' },
                update: { value: String(base_price_pro_trimestral) },
                create: { key: 'base_price_pro_trimestral', value: String(base_price_pro_trimestral), type: 'number' }
            }));
        }

        if (updates.length > 0) {
            await prisma.$transaction(updates);
        }

        console.log(`[ADMIN] User ${req.userEmail} updated base prices.`);
        res.json({ message: 'Precios base actualizados correctamente' });
    } catch (error) {
        console.error('Admin update prices error:', error);
        res.status(500).json({ error: 'Error al actualizar precios base' });
    }
});

export default router;
