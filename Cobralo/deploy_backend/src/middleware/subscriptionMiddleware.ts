import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from './authMiddleware';

/**
 * Verifica que el usuario tenga un plan Pro activo
 * Rechaza la solicitud si no es Pro
 */
export const requirePro = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isPro: true, plan: true, subscriptionExpiry: true }
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Verificar si el plan Pro está activo y no ha expirado
        const isProActive = user.isPro && 
                           user.plan === 'PRO' && 
                           (!user.subscriptionExpiry || new Date(user.subscriptionExpiry) > new Date());

        if (!isProActive) {
            res.status(403).json({ 
                error: 'Pasate a Pro para usar esta funcionalidad',
                requiresPro: true 
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Error en requirePro middleware:', error);
        res.status(500).json({ error: 'Error al verificar suscripción' });
    }
};

/**
 * Verifica límites dependiendo del plan del usuario
 * Para FREE: máximo 5 estudiantes
 * Para PRO: ilimitados
 */
export const checkStudentLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { plan: true, isPro: true }
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Solo verificar límite si está en plan FREE
        if (!user.isPro || user.plan !== 'PRO') {
            const studentCount = await prisma.student.count({
                where: { ownerId: req.userId }
            });

            // FREE plan: máximo 5 estudiantes (configurable)
            const FREE_STUDENT_LIMIT = 5;
            
            if (studentCount >= FREE_STUDENT_LIMIT) {
                res.status(403).json({ 
                    error: `Has alcanzado el límite de ${FREE_STUDENT_LIMIT} estudiantes en plan FREE. Pasate a Pro para agregar más.`,
                    requiresPro: true,
                    currentStudents: studentCount,
                    limit: FREE_STUDENT_LIMIT
                });
                return;
            }
        }

        next();
    } catch (error) {
        console.error('Error en checkStudentLimit middleware:', error);
        res.status(500).json({ error: 'Error al verificar límites' });
    }
};

/**
 * Middleware que adjunta información de features disponibles según el plan
 */
export const enrichWithFeatures = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return next();
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { plan: true, isPro: true }
        });

        // Definir features según el plan
        const features = {
            maxStudents: user?.isPro ? Infinity : 5,
            canGeneratePDF: user?.isPro ? true : false,
            canSendWhatsApp: user?.isPro ? true : false,
            canViewAdvancedReports: user?.isPro ? true : false,
            canExportData: user?.isPro ? true : false,
            hasAdvancedSupport: user?.isPro ? true : false,
            plan: user?.plan || 'FREE',
            isPro: user?.isPro || false
        };

        // Adjuntar features al request para usarlas en los controladores
        (req as any).features = features;
        
        next();
    } catch (error) {
        console.error('Error en enrichWithFeatures middleware:', error);
        next();
    }
};

/**
 * Middleware que bloquea a los usuarios FREE que volvieron de PRO
 * y superan el límite. Sólo les permite leer y borrar.
 */
export const enforceFreeRiderBlock = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Permitir solo lectura o borrado (para que puedan regularizar su cuenta)
    if (['GET', 'OPTIONS', 'DELETE'].includes(req.method)) return next();

    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Autenticación requerida' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { plan: true, isPro: true }
        });

        if (!user?.isPro || user.plan !== 'PRO') {
            const studentCount = await prisma.student.count({
                where: { ownerId: req.userId }
            });

            const FREE_STUDENT_LIMIT = 5;

            if (studentCount > FREE_STUDENT_LIMIT) {
                res.status(403).json({ 
                    error: `[LIMIT_EXCEEDED_LOCK] Tu cuenta tiene ${studentCount} alumnos, excediendo el límite de ${FREE_STUDENT_LIMIT} del plan FREE. Por favor elimina alumnos o suscríbete a PRO para desbloquear tus funciones.`,
                    requiresPro: true,
                    locked: true
                });
                return;
            }
        }
        next();
    } catch (error) {
        console.error('Error in enforceFreeRiderBlock:', error);
        next();
    }
};
