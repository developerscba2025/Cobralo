import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addStudentsToGroup,
    removeStudentFromGroup,
    addScheduleToGroup,
    linkScheduleToGroup
} from '../controllers/groupController';

const router = Router();

router.use(authMiddleware);

router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Student management
router.post('/:id/students', addStudentsToGroup);
router.delete('/:id/students/:studentId', removeStudentFromGroup);

// Schedule management
router.post('/:id/schedules', addScheduleToGroup);
router.post('/:id/schedules/link', linkScheduleToGroup);

export default router;
