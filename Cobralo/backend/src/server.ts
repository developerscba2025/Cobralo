import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { prisma } from './db';
import { authMiddleware } from './middleware/authMiddleware';
import { enrichWithFeatures } from './middleware/subscriptionMiddleware';
import { apiLimiter } from './middleware/rateLimiter';

import studentsRouter from './routes/students';
import authRouter from './routes/auth';
import paymentsRouter from './routes/payments';
import notesRouter from './routes/notes';
import calendarRouter from './routes/calendar';
import receiptsRouter from './routes/receipts';
import expensesRouter from './routes/expenses';
import attendanceRouter from './routes/attendance';
import subscriptionRouter from './routes/subscription';
import servicesRouter from './routes/serviceRoutes';
import ratingRoutes from './routes/ratings';
import paymentAccountsRouter from './routes/paymentAccounts';
import calendarFeedRouter from './routes/calendarFeed';
import supportRouter from './routes/support';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';
import { initReminderCron } from './jobs/reminderJob';
import { initClassReminderCron } from './jobs/classReminderJob';
import { initPriceAdjustmentCron } from './jobs/priceAdjustmentJob';
import { initSysMaintenanceCron } from './jobs/sysMaintenanceJob';
import notificationsRouter from './routes/notifications';
import paymentProofsRouter from './routes/paymentProofs';
import groupsRouter from './routes/groups';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const app = express();
app.set('trust proxy', true); // Trust all proxies (Cloudflare + CyberPanel/OpenLiteSpeed)
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

const defaultOrigins = [
  'https://cobralo.info',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : defaultOrigins;

app.use(express.json({ limit: '1mb' }));

// Global middleware to force UTF-8 charset on all JSON responses
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(body) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return originalJson.call(this, body);
  };
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    // Handle multiple origins in one string (common with some proxies)
    const origins = origin.split(',').map(o => o.trim());
    
    const isAllowed = origins.some(o => 
      allowedOrigins.includes(o) || 
      !!o.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: origin='${origin}', allowedOrigins=[${allowedOrigins.join(', ')}]`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public Routes
app.use('/api/public', publicRouter);

app.get('/', (req, res) => {
    res.send('Cobralo API is running');
});

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

// ── Google OAuth Routes (registered BEFORE authRouter to avoid interception) ─
{
    // In dev, redirect back to the Vite dev server, not FRONTEND_URL (which is production)
    const getFrontendUrl = () =>
        process.env.NODE_ENV === 'production'
            ? process.env.FRONTEND_URL!
            : 'http://localhost:5176';

    const googleOAuthClient = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID || '',
        process.env.GOOGLE_CLIENT_SECRET || '',
        process.env.GOOGLE_CALLBACK_URL ||
            (process.env.FRONTEND_URL?.includes('localhost')
                ? 'http://localhost:3000/api/auth/google/callback'
                : 'https://cobralo.info/api/auth/google/callback')
    );

    app.get('/api/auth/google', (_req, res) => {
        console.log('[Google OAuth] Generating auth URL...');
        try {
            const url = googleOAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: [
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/userinfo.email'
                ],
                prompt: 'consent'
            });
            console.log('[Google OAuth] Redirecting to:', url.substring(0, 80) + '...');
            res.redirect(url);
        } catch (err) {
            console.error('[Google OAuth] Error generating URL:', err);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=OAuthFailed`);
        }
    });

    app.get('/api/auth/google/callback', async (req, res) => {
        const code = req.query.code as string;
        console.log('[Google OAuth] Callback received, code present:', !!code);
        try {
            if (!code) throw new Error('No code');

            const { tokens } = await googleOAuthClient.getToken(code);
            googleOAuthClient.setCredentials(tokens);

            const userInfoRes = await googleOAuthClient.request({
                url: 'https://www.googleapis.com/oauth2/v2/userinfo'
            });
            const userInfo = userInfoRes.data as any;
            const { email, name, id: googleId } = userInfo;

            if (!email) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=EmailNotProvided`);
                return;
            }

            let user = await prisma.user.findUnique({ where: { email } });
            let isNewUser = false;
            if (user) {
                if (!user.googleId) {
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId } as any
                    });
                }
            } else {
                isNewUser = true;
                const crypto = require('crypto');
                user = await prisma.user.create({
                    data: {
                        email,
                        name,
                        googleId,
                        password: 'GOOGLE_OAUTH_NO_PASSWORD',
                        plan: 'INITIAL',
                        subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        isPro: false,
                        defaultService: 'General',
                        defaultPrice: 0,
                        calendarToken: crypto.randomBytes(20).toString('hex')
                    } as any
                });
            }

            const jwtSecret = process.env.JWT_SECRET!;
            const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
            console.log('[Google OAuth] Login successful for:', email, '| isNew:', isNewUser);

            if (isNewUser) {
                // New user: redirect to registration wizard step 2
                const nameEncoded = encodeURIComponent(name || '');
                const emailEncoded = encodeURIComponent(email);
                res.redirect(`${getFrontendUrl()}/app/login?token=${token}&isNew=true&gname=${nameEncoded}&gemail=${emailEncoded}`);
            } else {
                // Existing user: log them in directly
                res.redirect(`${getFrontendUrl()}/app/login?token=${token}`);
            }
        } catch (err) {
            console.error('[Google OAuth] Callback error:', err);
            res.redirect(`${getFrontendUrl()}/app/login?error=OAuthFailed`);
        }
    });
}

// Auth Route (handles its own internal auth for /me and /profile)
app.use('/api/auth', authRouter);

// Subscription endpoints handle their own auth per-route
app.use('/api/subscription', subscriptionRouter);

// Admin Panel — Protected by authMiddleware + requireAdmin (handles own auth)
app.use('/api/admin', adminRouter);
app.use('/api/ratings', ratingRoutes); 
app.use('/api/calendar-feed', calendarFeedRouter);
app.use('/api/support', supportRouter);
// Public attendance confirmation/cancel (no auth needed)

import { enforceFreeRiderBlock } from './middleware/subscriptionMiddleware';

// Protected Routes Middleware
app.use(authMiddleware, enrichWithFeatures);

app.use('/api/payment-accounts', paymentAccountsRouter);

// Bloqueo global de escritura para Free Riders
app.use(enforceFreeRiderBlock);

// (Subscription router was mounted above)
app.use('/api/students', studentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/services', servicesRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/payment-proofs', paymentProofsRouter);

// Initialize Automated Reminders
initReminderCron();
initClassReminderCron();
initPriceAdjustmentCron();
initSysMaintenanceCron();

app.listen(PORT as number, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
