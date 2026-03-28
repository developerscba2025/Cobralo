import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getServices = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }
        const services = await prisma.userService.findMany({
            where: { userId: req.userId }
        });
        res.json(services);
    } catch (error) {
        console.error('Error in getServices:', error);
        res.status(500).json({ error: 'Error fetching services' });
    }
};

export const createService = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }
        const { name, defaultPrice } = req.body;
        const service = await prisma.userService.create({
            data: {
                name,
                defaultPrice,
                userId: req.userId
            }
        });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Error creating service' });
    }
};

export const updateService = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }
        const { id } = req.params;
        const { name, defaultPrice, updateStudents } = req.body;
        
        // 1. Get old service info
        const oldService = await prisma.userService.findFirst({
            where: { id: Number(id), userId: req.userId }
        });

        if (!oldService) {
            res.status(404).json({ error: 'Servicio no encontrado' });
            return;
        }

        // 2. Update service
        const updatedService = await prisma.userService.update({
            where: { id: Number(id) },
            data: { name, defaultPrice }
        });

        let affectedStudents: any[] = [];

        // 3. Update students if requested
        if (updateStudents) {
            const students = await prisma.student.findMany({
                where: { 
                    ownerId: req.userId,
                    service_name: oldService.name
                }
            });

            for (const student of students) {
                const newPricePerHour = Number(defaultPrice);
                let newAmount = 0;

                if (student.planType === 'PACK') {
                    newAmount = newPricePerHour * (student.credits || 0);
                } else {
                    newAmount = newPricePerHour * (student.classes_per_month || 0);
                }

                const updated = await prisma.student.update({
                    where: { id: student.id },
                    data: {
                        service_name: name, // In case name also changed
                        price_per_hour: newPricePerHour,
                        amount: newAmount
                    }
                });
                affectedStudents.push(updated);
            }
        }
        
        res.json({ service: updatedService, affectedStudents });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Error updating service' });
    }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }
        const { id } = req.params;
        await prisma.userService.deleteMany({
            where: { id: Number(id), userId: req.userId }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting service' });
    }
};
