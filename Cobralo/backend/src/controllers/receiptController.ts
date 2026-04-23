import { Response } from 'express';
import { prisma } from '../db';
import PDFDocument from 'pdfkit';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/receipts - Get all receipts for the user
 * Feature PRO: Solo usuarios Pro pueden generar recibos PDF
 */
export const getAllReceipts = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const payments = await prisma.paymentHistory.findMany({
            where: { ownerId: req.userId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        service_name: true,
                        amount: true
                    }
                }
            },
            orderBy: { paidAt: 'desc' }
        });

        const receipts = payments.map((payment: any) => ({
            id: payment.id,
            receiptNumber: `RCP-${payment.id}-${payment.year}`,
            studentName: payment.student.name,
            studentPhone: payment.student.phone,
            amount: payment.amount,
            paidAt: payment.paidAt,
            month: payment.month,
            year: payment.year,
            service: payment.student.service_name
        }));

        res.json(receipts);
    } catch (error) {
        console.error('Error al obtener recibos:', error);
        res.status(500).json({ error: 'Error al obtener recibos' });
    }
};

/**
 * GET /api/receipts/:id - Generate PDF receipt
 * PRO FEATURE: Solo usuarios Pro pueden generar PDFs
 */
export const generateReceiptPDF = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        // Verificar que el usuario es Pro
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isPro: true, plan: true }
        });

        if (!user?.isPro || user.plan !== 'PRO') {
            res.status(403).json({
                error: 'Pasate a Pro para generar recibos en PDF',
                requiresPro: true,
                feature: 'PDF_RECEIPTS'
            });
            return;
        }

        const payment = await prisma.paymentHistory.findUnique({
            where: { 
                id: Number(id),
                ownerId: req.userId
            },
            include: {
                student: true,
                owner: true
            }
        });

        if (!payment) {
            res.status(404).json({ error: 'Pago no encontrado' });
            return;
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=recibo-${payment.id}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(25).text('RECIBO DE PAGO', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, { align: 'right' });
        doc.moveDown();

        // Business Info
        doc.fontSize(14).text(payment.owner.bizName || payment.owner.name, { align: 'left' });
        doc.fontSize(10).text(payment.owner.businessCategory || '', { align: 'left' });
        if (payment.owner.phoneNumber) {
            doc.fontSize(10).text(`Tel: ${payment.owner.phoneNumber}`, { align: 'left' });
        }
        if (payment.owner.bizAlias) {
            doc.fontSize(10).text(`Alias/CBU: ${payment.owner.bizAlias}`, { align: 'left' });
        }
        doc.moveDown();

        // Payment Details
        doc.rect(50, 200, 500, 150).stroke();

        doc.fontSize(12)
            .text(`Recibí de: ${payment.student.name}`, 70, 220)
            .text(`La suma de: ${payment.owner.currency || '$'}${Number(payment.amount).toLocaleString('es-AR')}`, 70, 250)
            .text(`En concepto de: ${payment.student.service_name} - Mes ${payment.month}/${payment.year}`, 70, 280)
            .text(`Fecha de pago original: ${new Date(payment.paidAt).toLocaleDateString('es-AR')}`, 70, 310);

        // Signature area
        doc.moveTo(350, 450).lineTo(500, 450).stroke();
        doc.text('Firma / Sello', 350, 460, { align: 'center', width: 150 });

        // Footer
        if (payment.owner.receiptFooter) {
            doc.moveDown(4);
            doc.fontSize(10).text(payment.owner.receiptFooter, { align: 'center', oblique: true });
        }

        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error generating PDF' });
        }
    }
};

/**
 * POST /api/receipts/:id/send-whatsapp - Send receipt via WhatsApp
 * PRO FEATURE: Solo usuarios Pro
 */
export const sendReceiptViaWhatsApp = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isPro: true, plan: true }
        });

        if (!user?.isPro || user.plan !== 'PRO') {
            res.status(403).json({
                error: 'Pasate a Pro para enviar recibos por WhatsApp',
                requiresPro: true,
                feature: 'WHATSAPP_RECEIPTS'
            });
            return;
        }

        const payment = await prisma.paymentHistory.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                }
            }
        });

        if (!payment) {
            res.status(404).json({ error: 'Pago no encontrado' });
            return;
        }

        res.json({
            message: 'Recibo enviado por WhatsApp exitosamente',
            sentTo: payment.student.phone,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error al enviar WhatsApp:', error);
        res.status(500).json({ error: 'Error al enviar WhatsApp' });
    }
};
