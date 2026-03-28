import { Router } from 'express';
import {
    getAllReceipts,
    generateReceiptPDF,
    sendReceiptViaWhatsApp
} from '../controllers/receiptController';

import { requirePro } from '../middleware/subscriptionMiddleware';

const router = Router();

// GET all receipts - accesible por todos (para ver listado)
router.get('/', getAllReceipts);

// GET generate PDF for a receipt - SOLO PRO
router.get('/:id', requirePro, generateReceiptPDF);

// POST send via WhatsApp - SOLO PRO
router.post('/:id/send-whatsapp', requirePro, sendReceiptViaWhatsApp);

export default router;
