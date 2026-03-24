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
import { initReminderCron } from './jobs/reminderJob';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

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

// Subscription Webhook must be public
app.use('/api/subscription/webhook', subscriptionRouter); 
app.use('/api/ratings', ratingRoutes); 
app.use('/api/calendar-feed', calendarFeedRouter);

// Protected Routes Middleware
app.use(authMiddleware, enrichWithFeatures);

app.use('/api/payment-accounts', paymentAccountsRouter);
app.use('/api/subscription', subscriptionRouter); // Other subscription routes need auth
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
