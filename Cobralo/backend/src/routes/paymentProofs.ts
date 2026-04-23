import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 uploads per hour
    message: { error: 'Demasiados comprobantes enviados. Por favor, intentalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

// PUBLIC: Sube un comprobante de transferencia
router.post('/public/:token', uploadLimiter, upload.single('verification_image'), uploadPaymentProof);

// PROTEGIDO: Frontend del profesor
router.get('/pending', authMiddleware, getPendingProofsForTeacher);
router.patch('/:id/review', authMiddleware, reviewPaymentProof);

export default router;
