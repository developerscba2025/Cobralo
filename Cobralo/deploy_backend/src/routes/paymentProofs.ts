import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
    uploadPaymentProof, 
    getPendingProofsForTeacher, 
    reviewPaymentProof 
} from '../controllers/paymentProofController';
import { authMiddleware } from '../middleware/authMiddleware';

const uploadDir = path.join(__dirname, '../../uploads');

// Asegurarse de que el directorio existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB límite
});

const router = Router();

// PUBLIC: Sube un comprobante de transferencia
router.post('/public/:token', upload.single('verification_image'), uploadPaymentProof);

// PROTEGIDO: Frontend del profesor
router.get('/pending', authMiddleware, getPendingProofsForTeacher);
router.patch('/:id/review', authMiddleware, reviewPaymentProof);

export default router;
