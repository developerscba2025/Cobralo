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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://cobraloapp.com', // The App
  process.env.LANDING_URL || 'https://cobralo.info',   // The Landing
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/api', apiLimiter);

// Public Routes
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

// Protected Routes Middleware
app.use(authMiddleware, enrichWithFeatures);

app.use('/api/payment-accounts', paymentAccountsRouter);
// (Subscription router was mounted above)
app.use('/api/students', studentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/services', servicesRouter);

// Initialize Automated Reminders
initReminderCron();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
