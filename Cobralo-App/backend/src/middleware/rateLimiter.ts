import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per `window` for auth routes
	message: {
		error: 'Demasiados intentos desde esta IP, por favor intenta de nuevo en 15 minutos.'
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Limit each IP to 100 requests per minute
	message: {
		error: 'Demasiadas solicitudes, por favor intenta más tarde.'
	},
	standardHeaders: true,
	legacyHeaders: false,
});
