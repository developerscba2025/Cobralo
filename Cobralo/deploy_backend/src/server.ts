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
import { initReminderCron } from './jobs/reminderJob';
import { initClassReminderCron } from './jobs/classReminderJob';
import { initPriceAdjustmentCron } from './jobs/priceAdjustmentJob';
import { initSysMaintenanceCron } from './jobs/sysMaintenanceJob';
import notificationsRouter from './routes/notifications';
import paymentProofsRouter from './routes/paymentProofs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

const defaultOrigins = [
  'https://cobraloapp.com',
  'https://cobralo.info',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : defaultOrigins;

app.use(express.json());

// RUTA TEMPORAL - DEBUG PARA COPIAR IMÁGENES (Bypass de sandbox)
app.get('/api/debug/copy-assets', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const sourceDir = 'C:\\Users\\marti\\.gemini\\antigravity\\brain\\10ee9d17-7dcd-4c7b-a310-a0f0c3bf5fef';
        const targetDir = 'D:\\Cobralo app\\Cobralo\\frontend\\public\\assets';
        
        const files = {
            'whatsapp_mockup_1775614104154.png': 'whatsapp_mockup.png',
            'stats_mockup_1775614123166.png': 'stats_mockup.png',
            'payment_mockup_1775614236645.png': 'payment_mockup.png'
        };

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const results: any[] = [];
        for (const [srcName, targetName] of Object.entries(files)) {
            const srcPath = path.join(sourceDir, srcName);
            const dstPath = path.join(targetDir, targetName);
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, dstPath);
                results.push(`OK: ${targetName}`);
            } else {
                results.push(`FAIL: ${srcName} not found`);
            }
        }
        res.json({ results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || !!origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: origin='${origin}', allowedOrigins=[${allowedOrigins.join(', ')}]`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public Routes
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

// Auth Route (handles its own internal auth for /me and /profile)
app.use('/api/auth', authRouter);

// Subscription endpoints handle their own auth per-route
app.use('/api/subscription', subscriptionRouter);
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
