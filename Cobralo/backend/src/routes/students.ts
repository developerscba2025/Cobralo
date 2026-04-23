import { Router } from 'express';
import {
    getAllStudents,
    getStudentById,
    createStudent,
    deleteStudent,
    updateStudent,
    toggleStudentStatus,
    updatePrices,
    resetMonth,
    getPendingContacts,
    getPendingCount,
    getDashboardSummary,
    getWhatsappDigest,
    sendBulkMessage
} from '../controllers/studentController';
import { checkStudentLimit } from '../middleware/subscriptionMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// PUT update prices
router.put('/update-prices', updatePrices);

// POST reset all students to pending (monthly reset)
router.post('/reset-month', resetMonth);

// POST bulk message based on wildcard template
router.post('/bulk-message', sendBulkMessage);

// GET pending students for mass WhatsApp
router.get('/pending-contacts', getPendingContacts);

// GET count of pending students (lightweight — used for sidebar badge)
router.get('/pending/count', getPendingCount);

// GET dashboard summary stats (lightweight)
router.get('/dashboard/summary', getDashboardSummary);

// GET all students
router.get('/', getAllStudents);

// GET single student whatsapp digest
router.get('/:id/whatsapp-digest', getWhatsappDigest);

// GET single student
router.get('/:id', getStudentById);

// POST create student
router.post('/', checkStudentLimit, createStudent);

// DELETE student
router.delete('/:id', deleteStudent);

// PUT update student
router.put('/:id', updateStudent);

// PATCH toggle payment
router.patch('/:id/toggle', toggleStudentStatus);

export default router;
