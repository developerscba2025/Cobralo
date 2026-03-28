import { Router } from 'express';
import {
    getAllSchedules,
    getStudentSchedules,
    getWeeklySchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from '../controllers/calendarController';

const router = Router();

// GET all schedules (optionally by day)
router.get('/', getAllSchedules);

// GET weekly summary
router.get('/weekly', getWeeklySchedule);

// GET schedules for a student
router.get('/student/:studentId', getStudentSchedules);

// POST create schedule
router.post('/', createSchedule);

// PUT update schedule
router.put('/:id', updateSchedule);

// DELETE schedule
router.delete('/:id', deleteSchedule);

export default router;
