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
    getPendingContacts
} from '../controllers/studentController';

const router = Router();

// PUT update prices
router.put('/update-prices', updatePrices);

// POST reset all students to pending (monthly reset)
router.post('/reset-month', resetMonth);

// GET pending students for mass WhatsApp
router.get('/pending-contacts', getPendingContacts);

// GET all students
router.get('/', getAllStudents);

// GET single student
router.get('/:id', getStudentById);

// POST create student
router.post('/', createStudent);

// DELETE student
router.delete('/:id', deleteStudent);

// PUT update student
router.put('/:id', updateStudent);

// PATCH toggle payment
router.patch('/:id/toggle', toggleStudentStatus);

export default router;
