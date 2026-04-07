import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per `window` for auth routes
	message: {
		error: 'Demasiados intentos desde esta IP, por favor intenta de nuevo en 15 minutos.'
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: isDev ? 1000 : 200, // More lenient in dev; 200 req/min in production
	message: {
		error: 'Demasiadas solicitudes, por favor intenta más tarde.'
	},
	standardHeaders: true,
	legacyHeaders: false,
	skip: () => isDev, // Completely bypass rate limiting in local development
});
