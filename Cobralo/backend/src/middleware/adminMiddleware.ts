import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthRequest } from './authMiddleware';

/**
 * Middleware que verifica que el usuario autenticado tiene isAdmin: true
 * La verificación se hace contra la DB (no solo el JWT) para revocación inmediata
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isAdmin: true }
        });

        if (!user || !user.isAdmin) {
            res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
            return;
        }

        next();
    } catch (error) {
        console.error('Error en requireAdmin middleware:', error);
        res.status(500).json({ error: 'Error al verificar permisos' });
    }
};
