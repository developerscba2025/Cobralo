import { Router } from 'express';
import { prisma } from '../db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('✅ Ratings router initialized');

// Middleware for auth (inline for simplicity if needed, but better use shared one)
const auth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'token invalido' });
    }
};

import { requirePro } from '../middleware/subscriptionMiddleware';

// GET /api/ratings/top-teachers - Public route to show top rated PRO teachers
router.get('/top-teachers', async (req, res) => {
    try {
        const topTeachers = await prisma.user.findMany({
            where: { isPro: true },
            select: {
                id: true,
                name: true,
                bizName: true,
                businessCategory: true,
                ratings: {
                    select: {
                        value: true,
                        comment: true,
                        studentName: true,
                        showComment: true,
                        createdAt: true
                    }
                }
            }
        });

        const formattedTeachers = topTeachers.map(user => {
            const ratingsCount = user.ratings.length;
            const avgRating = ratingsCount > 0 
                ? user.ratings.reduce((acc, r) => acc + r.value, 0) / ratingsCount 
                : 0;
            
            // Get latest featured review (one with showComment=true)
            const latestReview = user.ratings
                .filter(r => r.showComment)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

            return {
                id: user.id,
                name: user.name,
                bizName: user.bizName,
                category: user.businessCategory,
                avgRating: Number(avgRating.toFixed(1)),
                reviewCount: ratingsCount,
                featuredReview: latestReview ? {
                    comment: latestReview.comment,
                    author: latestReview.studentName,
                    date: latestReview.createdAt
                } : null
            };
        })
        .filter(t => t.reviewCount > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 6);

        res.json(formattedTeachers);
    } catch (error) {
        console.error('Error fetching top teachers:', error);
        res.status(500).json({ error: 'Error al obtener profesores destacados' });
    }
});

// GET /api/ratings/public/profile/:id - Public route to show a teacher's full profile
router.get('/public/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                bizName: true,
                businessCategory: true,
                ratings: {
                    where: { showComment: true },
                    select: {
                        value: true,
                        comment: true,
                        studentName: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }

        const avgRating = user.ratings.length > 0
            ? user.ratings.reduce((acc, r) => acc + r.value, 0) / user.ratings.length
            : 0;

        res.json({
            ...user,
            avgRating: Number(avgRating.toFixed(1)),
            reviewCount: user.ratings.length
        });
    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({ error: 'Error al obtener el perfil' });
    }
});

// POST /api/ratings/generate-link - Teacher generates a temporary link
router.post('/generate-link', auth, requirePro, async (req: any, res) => {
    console.log('📍 POST /api/ratings/generate-link called by user:', req.userId);
    try {
        const userId = req.userId;
        const token = crypto.randomBytes(16).toString('hex');
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days expiry

        await prisma.user.update({
            where: { id: userId },
            data: {
                ratingToken: token,
                ratingTokenExpires: expires
            }
        });

        res.json({ token, expires });
    } catch (error) {
        console.error('Error al generar el link:', error);
        res.status(500).json({ error: 'Error al generar el link' });
    }
});

// GET /api/ratings/me - Teacher gets their ratings
router.get('/me', auth, async (req: any, res) => {
    try {
        const userId = req.userId;
        const ratings = await prisma.rating.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las calificaciones' });
    }
});

// GET /api/ratings/public/teacher/:token - Public route to get teacher info for rating page
router.get('/public/teacher/:token', async (req, res) => {
    console.log('📍 GET /api/ratings/public/teacher called for token:', req.params.token);
    try {
        const { token } = req.params;
        console.log('📍 Seeking user with token:', token, 'at time:', new Date().toISOString());
        const user = await prisma.user.findFirst({
            where: {
                ratingToken: token
            },
            select: {
                id: true,
                name: true,
                bizName: true,
                ratingTokenExpires: true,
                email: true
            }
        });

        if (!user) {
            console.log('❌ User not found for token:', token);
            return res.status(404).json({ error: 'Link inválido' });
        }

        // Check expiration explicitly for logging
        const now = new Date();
        const expires = user.ratingTokenExpires;
        console.log('📍 Token found for user:', user.email, 'Expires:', expires?.toISOString());

        if (expires && expires < now) {
            console.log('❌ Token expired at:', expires.toISOString());
            return res.status(404).json({ error: 'Link expirado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener info del profesor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// POST /api/ratings/public/submit/:token - Public route to submit a rating
router.post('/public/submit/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { value, comment, studentName } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                ratingToken: token,
                ratingTokenExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Link inválido o expirado' });
        }

        const rating = await prisma.rating.create({
            data: {
                ownerId: user.id,
                value: Number(value),
                comment,
                studentName: studentName || 'Anónimo'
            }
        });

        res.json({ message: '¡Gracias por tu calificación!', rating });
    } catch (error) {
        console.error('Error al enviar la calificación:', error);
        res.status(500).json({ error: 'No se pudo enviar la calificación' });
    }
});

// PATCH /api/ratings/:id/toggle-comment - Teacher toggles comment visibility
router.patch('/:id/toggle-comment', auth, async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const rating = await prisma.rating.findFirst({
            where: { id: Number(id), ownerId: userId }
        });

        if (!rating) {
            return res.status(404).json({ error: 'Calificación no encontrada' });
        }

        const updated = await prisma.rating.update({
            where: { id: Number(id) },
            data: { 
                showComment: !rating.showComment 
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error al togglear comentario:', error);
        res.status(500).json({ error: 'Error al actualizar visibilidad' });
    }
});

export default router;
