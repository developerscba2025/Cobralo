import { Router } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('⚠️  FATAL: JWT_SECRET no está configurado en las variables de entorno.');
    process.exit(1);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, bizName, businessCategory, phoneNumber } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password y nombre son requeridos' });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'El email ya está registrado' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                bizName,
                businessCategory,
                phoneNumber
            }
        });

        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isPro: user.isPro,
                plan: user.plan
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email y password son requeridos' });
            return;
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isPro: user.isPro,
                plan: user.plan
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                bizName: true,
                bizAlias: true,
                businessCategory: true,
                phoneNumber: true,
                reminderTemplate: true,
                defaultPrice: true,
                defaultService: true,
                defaultSurcharge: true,
                currency: true,
                receiptFooter: true,
                taxId: true,
                billingAddress: true,
                isPro: true,
                plan: true,
                subscriptionExpiry: true,
                paymentAccounts: true,
                calendarToken: true
            }
        });

        if (!user) {
            res.status(401).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Generate calendarToken if it doesn't exist
        if (!user.calendarToken) {
            const randomToken = require('crypto').randomBytes(20).toString('hex');
            const userWithToken = await prisma.user.update({
                where: { id: user.id },
                data: { calendarToken: randomToken },
                select: {
                    id: true, email: true, name: true, bizName: true, bizAlias: true, businessCategory: true,
                    phoneNumber: true, reminderTemplate: true, defaultPrice: true, defaultService: true,
                    defaultSurcharge: true, currency: true, receiptFooter: true, taxId: true, billingAddress: true,
                    isPro: true, plan: true, paymentAccounts: true, calendarToken: true
                }
            });
            res.json(userWithToken);
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

// PUT /api/auth/profile - Update user profile and settings
router.put('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

        const { name, email, bizName, bizAlias, businessCategory, phoneNumber, taxId, billingAddress, reminderTemplate, defaultPrice, defaultService, defaultSurcharge, currency, receiptFooter } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                name,
                email,
                bizName,
                bizAlias,
                businessCategory,
                phoneNumber,
                reminderTemplate,
                defaultPrice: defaultPrice !== undefined ? Number(defaultPrice) : undefined,
                defaultService,
                defaultSurcharge: defaultSurcharge !== undefined ? Number(defaultSurcharge) : undefined,
                currency,
                receiptFooter,
                taxId,
                billingAddress
            },
            select: {
                id: true,
                email: true,
                name: true,
                bizName: true,
                bizAlias: true,
                businessCategory: true,
                phoneNumber: true,
                reminderTemplate: true,
                defaultPrice: true,
                defaultService: true,
                defaultSurcharge: true,
                currency: true,
                receiptFooter: true,
                taxId: true,
                billingAddress: true,
                isPro: true,
                plan: true,
                paymentAccounts: true,
                calendarToken: true
            }
        });

        // Generate calendarToken if it doesn't exist
        if (!updatedUser.calendarToken) {
            const randomToken = require('crypto').randomBytes(20).toString('hex');
            const userWithToken = await prisma.user.update({
                where: { id: updatedUser.id },
                data: { calendarToken: randomToken },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bizName: true,
                    bizAlias: true,
                    businessCategory: true,
                    phoneNumber: true,
                    reminderTemplate: true,
                    defaultPrice: true,
                    defaultService: true,
                    defaultSurcharge: true,
                    currency: true,
                    receiptFooter: true,
                    taxId: true,
                    billingAddress: true,
                    isPro: true,
                    plan: true,
                    paymentAccounts: true,
                    calendarToken: true
                }
            });
            res.json(userWithToken);
            return;
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
            return;
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            res.status(401).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Check current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'La contraseña actual es incorrecta' });
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Error al cambiar la contraseña' });
    }
});

export default router;
