import { Router } from 'express';
import {
    getStudentNotes,
    createNote,
    updateNote,
    deleteNote
} from '../controllers/noteController';

const router = Router();

// GET notes for a student
router.get('/student/:studentId', getStudentNotes);

// POST create note
router.post('/', createNote);

// PUT update note
router.put('/:id', updateNote);

// DELETE note
router.delete('/:id', deleteNote);

export default router;
