import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET /api/notes/student/:studentId - Get all notes for a student
 */
export const getStudentNotes = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        // Verificar que el estudiante pertenece al usuario
        const student = await prisma.student.findFirst({
            where: {
                id: parseInt(studentId as any),
                ownerId: req.userId
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        const notes = await prisma.studentNote.findMany({
            where: {
                studentId: parseInt(studentId as any),
                ownerId: req.userId
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(notes);
    } catch (error) {
        console.error('Error al obtener notas:', error);
        res.status(500).json({ error: 'Error al obtener notas' });
    }
};

/**
 * POST /api/notes - Create a new note for a student
 */
export const createNote = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, content } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        if (!studentId || !content) {
            res.status(400).json({
                error: 'studentId y content son requeridos'
            });
            return;
        }

        // Verificar que el estudiante pertenece al usuario
        const student = await prisma.student.findFirst({
            where: {
                id: parseInt(studentId as any),
                ownerId: req.userId
            }
        });

        if (!student) {
            res.status(404).json({ error: 'Estudiante no encontrado' });
            return;
        }

        const note = await prisma.studentNote.create({
            data: {
                ownerId: req.userId,
                studentId: parseInt(studentId as any),
                content
            }
        });

        res.json(note);
    } catch (error) {
        console.error('Error al crear nota:', error);
        res.status(500).json({ error: 'Error al crear nota' });
    }
};

/**
 * PUT /api/notes/:id - Update a note
 */
export const updateNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const note = await prisma.studentNote.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!note) {
            res.status(404).json({ error: 'Nota no encontrada' });
            return;
        }

        const updated = await prisma.studentNote.update({
            where: { id: parseInt(id as any) },
            data: { content }
        });

        res.json(updated);
    } catch (error) {
        console.error('Error al actualizar nota:', error);
        res.status(500).json({ error: 'Error al actualizar nota' });
    }
};

/**
 * DELETE /api/notes/:id - Delete a note
 */
export const deleteNote = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (!req.userId) {
            res.status(401).json({ error: 'Autenticación requerida' });
            return;
        }

        const note = await prisma.studentNote.findFirst({
            where: {
                id: parseInt(id as any),
                ownerId: req.userId
            }
        });

        if (!note) {
            res.status(404).json({ error: 'Nota no encontrada' });
            return;
        }

        await prisma.studentNote.delete({
            where: { id: parseInt(id as any) }
        });

        res.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Error al eliminar nota:', error);
        res.status(500).json({ error: 'Error al eliminar nota' });
    }
};
