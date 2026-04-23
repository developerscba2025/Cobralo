import { Router } from 'express';
import { prisma } from '../db';
import { notificationService } from '../services/notificationService';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


// Ratings router

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
            where: { isPublicProfileVisible: true }, // Show everyone who is public
            select: {
                id: true,
                name: true,
                bizName: true,
                businessCategory: true,
                biography: true,
                city: true,
                tags: true,
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
                biography: (user as any).biography,
                city: user.city,
                tags: user.tags ? user.tags.split(',') : [],
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
                isPublicProfileVisible: true,
                isPro: true,
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

        if (!user || !user.isPro || (!user.isPublicProfileVisible && (req as any).userId !== user.id)) {
            return res.status(404).json({ error: 'Profesor no encontrado, perfil privado o requiere plan PRO' });
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
    try {
        const { token } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                ratingToken: token
            },
            select: {
                id: true,
                name: true,
                bizName: true,
                ratingTokenExpires: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Link inválido' });
        }

        // Check expiration
        const now = new Date();
        const expires = user.ratingTokenExpires;

        if (expires && expires < now) {
            return res.status(404).json({ error: 'Link expirado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener info del profesor:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

import rateLimit from 'express-rate-limit';

const submitRatingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per window
    message: { error: 'Demasiadas calificaciones enviadas. Por favor, intentalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/ratings/public/submit/:token - Public route to submit a rating
router.post('/public/submit/:token', submitRatingLimiter, async (req, res) => {
    try {
        const { token } = req.params;
        const { value, comment, studentName } = req.body;

        if (!value || isNaN(Number(value)) || Number(value) < 1 || Number(value) > 5) {
            return res.status(400).json({ error: 'La calificación debe ser un número entre 1 y 5' });
        }

        const user = await prisma.user.findFirst({
            where: {
                ratingToken: String(token) as string,
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

const contactTeacherLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 contact requests per hour
    message: { error: 'Demasiados mensajes enviados. Por favor, intentalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/ratings/public/profile/:id/contact - Public route to contact a teacher
router.post('/public/profile/:id/contact', contactTeacherLimiter, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: { email: true, name: true, bizName: true, isPro: true }
        });

        if (!user || !user.isPro) {
            return res.status(404).json({ error: 'Profesor no encontrado o no disponible para contacto' });
        }

        // Send email using notificationService
        const subject = `Nuevo mensaje de contacto de ${name} - Cobralo`;
        const emailBody = `
            <h2>Has recibido un nuevo mensaje de contacto</h2>
            <p><strong>De:</strong> ${name} (${email})</p>
            <p><strong>Para:</strong> ${user.bizName || user.name}</p>
            <hr />
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
            <hr />
            <p><small>Este mensaje fue enviado a través de tu perfil público en Cobralo.</small></p>
        `;

        await notificationService.sendEmail(user.email, subject, emailBody);

        res.json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.error('Error in contact teacher route:', error);
        res.status(500).json({ error: 'No se pudo enviar el mensaje' });
    }
});

export default router;
