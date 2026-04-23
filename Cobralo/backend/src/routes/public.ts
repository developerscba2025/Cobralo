import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * GET /api/public/landing-data
 * Obtiene los profesores destacados y los testimonios para la landing page
 */
router.get('/landing-data', async (req: Request, res: Response) => {
    try {
        const featuredUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { isFeatured: true },
                    { testimonial: { not: null, notIn: [""] } }
                ]
            },
            select: {
                name: true,
                bizName: true,
                businessCategory: true,
                city: true,
                isFeatured: true,
                testimonial: true,
                photoUrl: true,
                _count: { select: { students: true } },
                ratings: { select: { value: true } }
            }
        });

        const teachers = [];
        const testimonials = [];

        for (const user of featuredUsers) {
            // Compute average rating or default to 5.0
            let avgRating = 5.0;
            if (user.ratings && user.ratings.length > 0) {
                const total = user.ratings.reduce((acc: number, r: any) => acc + r.value, 0);
                avgRating = total / user.ratings.length;
            }

            if (user.isFeatured) {
                teachers.push({
                    name: user.name,
                    bizName: user.bizName || user.name,
                    category: user.businessCategory || 'Profesional',
                    location: user.city || 'Argentina',
                    avgRating,
                    students: user._count.students,
                    photoUrl: user.photoUrl
                });
            }

            if (user.testimonial) {
                testimonials.push({
                    name: user.name,
                    initials: (user.name || user.bizName || 'P').charAt(0).toUpperCase(),
                    role: `${user.businessCategory || 'Profesional'} · ${user.city || 'Argentina'}`,
                    text: user.testimonial,
                    rating: Math.round(avgRating),
                    photoUrl: user.photoUrl
                });
            }
        }

        res.json({
            featuredTeachers: teachers,
            testimonials: testimonials
        });
    } catch (error) {
        console.error('Error fetching landing data:', error);
        res.status(500).json({ error: 'Error al obtener datos públicos' });
    }
});

export default router;
