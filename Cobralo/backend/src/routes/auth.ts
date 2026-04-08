import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authLimiter } from '../middleware/rateLimiter';
import { notificationService } from '../services/notificationService';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { encrypt } from '../utils/crypto';

const router = Router();
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('⚠️  FATAL: JWT_SECRET no está configurado en las variables de entorno.');
    process.exit(1);
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req: Request, res: Response) => {
    try {
        let { email, password, name, bizName, businessCategory, phoneNumber } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password y nombre son requeridos' });
            return;
        }

        // Normalización
        email = email.toLowerCase().trim();

        // Complejidad de Contraseña
        if (!PASSWORD_REGEX.test(password)) {
            res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)' });
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

        // Create user with 14-day Trial (Plan Inicial)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                bizName,
                businessCategory,
                phoneNumber,
                plan: 'INITIAL',
                subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
                isPro: false // Trial is now for the BASIC plan
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
router.post('/login', authLimiter, async (req: Request, res: Response) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email y password son requeridos' });
            return;
        }

        email = email.toLowerCase().trim();

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

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
    try {
        let { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'Email es requerido' });
            return;
        }

        email = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // No revelamos si el email existe por seguridad, pero enviamos 200
            res.json({ message: 'Si el email está registrado, recibirás un enlace de recuperación pronto.' });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hash,
                resetPasswordExpires: expires
            }
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        
        await notificationService.sendEmail(
            user.email,
            'Recupera tu contraseña de Cobralo',
            `Hola ${user.name},\n\nHas solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:\n\n${resetLink}\n\nSi no has solicitado este cambio, puedes ignorar este correo.\n\nEste enlace expirará en 1 hora.`
        );

        res.json({ message: 'Si el email está registrado, recibirás un enlace de recuperación pronto.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            res.status(400).json({ error: 'Token y password son requeridos' });
            return;
        }

        if (!PASSWORD_REGEX.test(password)) {
            res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)' });
            return;
        }

        const hash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hash,
                resetPasswordExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            res.status(400).json({ error: 'El token es inválido o ha expirado' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
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
                biography: true,
                photoUrl: true,
                instagramUrl: true,
                facebookUrl: true,
                subscriptionExpiry: true,
                paymentAccounts: true,
                calendarToken: true,
                ratingToken: true,
                ratingTokenExpires: true
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
                    isPro: true, plan: true, biography: true, photoUrl: true, instagramUrl: true, facebookUrl: true, paymentAccounts: true, calendarToken: true,
                    ratingToken: true, ratingTokenExpires: true
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
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { 
            name, email, bizName, bizAlias, businessCategory, phoneNumber, taxId, 
            billingAddress, reminderTemplate, defaultPrice, defaultService, 
            defaultSurcharge, currency, receiptFooter,
            notificationsEnabled, isPublicProfileVisible,
            biography, photoUrl, instagramUrl, facebookUrl, mpAccessToken
        } = req.body;

        const dataToUpdate: any = {
            name, email, bizName, bizAlias, businessCategory, phoneNumber,
            reminderTemplate, defaultPrice: defaultPrice !== undefined ? Number(defaultPrice) : undefined,
            defaultService, defaultSurcharge: defaultSurcharge !== undefined ? Number(defaultSurcharge) : undefined,
            currency, receiptFooter, taxId, billingAddress,
            notificationsEnabled: notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : undefined,
            isPublicProfileVisible: isPublicProfileVisible !== undefined ? Boolean(isPublicProfileVisible) : undefined,
            biography, photoUrl, instagramUrl, facebookUrl
        };

        if (mpAccessToken) {
            dataToUpdate.mpAccessToken = encrypt(mpAccessToken);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: dataToUpdate,
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
                notificationsEnabled: true,
                isPublicProfileVisible: true,
                biography: true,
                photoUrl: true,
                instagramUrl: true,
                facebookUrl: true,
                paymentAccounts: true,
                calendarToken: true,
                ratingToken: true,
                ratingTokenExpires: true
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
                    biography: true,
                    photoUrl: true,
                    instagramUrl: true,
                    facebookUrl: true,
                    paymentAccounts: true,
                    calendarToken: true,
                    ratingToken: true,
                    ratingTokenExpires: true
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
router.post('/change-password', authLimiter, authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
            return;
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)' });
            return;
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
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
            where: { id: req.userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Error al cambiar la contraseña' });
    }
});

// DELETE /api/auth/delete-account - Delete current account with password protection
router.delete('/delete-account', authLimiter, authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            res.status(400).json({ error: 'La contraseña es requerida para eliminar la cuenta.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) {
            res.status(401).json({ error: 'Usuario no encontrado' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Contraseña incorrecta. Operación cancelada.' });
            return;
        }

        await prisma.user.delete({
            where: { id: req.userId }
        });
        
        res.json({ message: 'Cuenta y todos los datos asociados eliminados exitosamente.' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Error al eliminar la cuenta' });
    }
});

export default router;
