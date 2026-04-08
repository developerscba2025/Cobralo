import { Response } from 'express';
import { prisma } from '../db';

export const uploadPaymentProof = async (req: any, res: Response) => {
    try {
        const { token } = req.params;

        // Validar que se ha subido una imagen
        if (!req.file) {
            res.status(400).json({ error: 'Debes adjuntar un comprobante' });
            return;
        }

        const student = await prisma.student.findUnique({
            where: { paymentToken: token }
        });

        if (!student) {
            res.status(404).json({ error: 'Enlace inválido o caducado' });
            return;
        }

        const proof = await prisma.paymentProof.create({
            data: {
                token: token + '-' + Date.now().toString(), // Para diferenciar pruebas del mismo token base
                studentId: student.id,
                ownerId: student.ownerId,
                imageUrl: '/uploads/' + req.file.filename,
                status: 'pending'
            }
        });

        res.json({ message: 'Comprobante recibido exitosamente', proof });

    } catch (error) {
        console.error('Error al subir el comprobante:', error);
        res.status(500).json({ error: 'Ocurrió un error al procesar el archivo. Por favor intenta más tarde.' });
    }
};

export const getPendingProofsForTeacher = async (req: any, res: Response) => {
    try {
        const proofs = await prisma.paymentProof.findMany({
            where: { 
                ownerId: req.userId,
                status: 'pending'
            },
            include: {
                student: {
                    select: { name: true, service_name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los comprobantes' });
    }
};

export const reviewPaymentProof = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' o 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            res.status(400).json({ error: 'Estado inválido' });
            return;
        }

        const proof = await prisma.paymentProof.update({
            where: { id: Number(id), ownerId: req.userId },
            data: { status }
        });

        res.json(proof);
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
};
