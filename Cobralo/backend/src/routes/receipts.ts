import { Router } from 'express';
import {
    getAllReceipts,
    generateReceiptPDF,
    sendReceiptViaWhatsApp
} from '../controllers/receiptController';

const router = Router();

// GET all receipts
router.get('/', getAllReceipts);

// GET generate PDF for a receipt
router.get('/:id', generateReceiptPDF);

// POST send via WhatsApp
router.post('/:id/send-whatsapp', sendReceiptViaWhatsApp);

export default router;
