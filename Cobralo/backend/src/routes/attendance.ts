import { Router } from 'express';
import { 
    getStudentAttendance, 
    recordAttendance, 
    updateAttendance 
} from '../controllers/attendanceController';

const router = Router();

// POST /api/attendance - Mark attendance
router.post('/', recordAttendance);

// GET /api/attendance/student/:id - Get history
router.get('/student/:id', getStudentAttendance);

// PUT /api/attendance/:id - Update status (e.g. fix mistake)
router.put('/:id', updateAttendance);

export default router;
