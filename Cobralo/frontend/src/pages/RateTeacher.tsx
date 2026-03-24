import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Send, CheckCircle2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RateTeacher = () => {
    const { token } = useParams<{ token: string }>();
    const [teacher, setTeacher] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [studentName, setStudentName] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        const fetchTeacher = async () => {
            if (!token) return;
            try {
                const data = await api.getPublicTeacher(token);
                setTeacher(data);
            } catch (err) {
                setError('El link es inválido o ya expiró.');
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        try {
            await api.submitRating(token, {
                value: rating,
                comment,
                studentName
            });
            setSuccess(true);
        } catch (err) {
            setError('Error al enviar la calificación.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Star size={40} className="fill-current" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">¡Ups! Algo salió mal</h1>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
                    <p className="text-sm text-slate-400">Por favor, pedile un nuevo link a tu profesor.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl border border-slate-100"
                >
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 size={56} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">¡Gracias!</h1>
                    <p className="text-slate-500 font-bold mb-8 text-lg">Tu calificación para <span className="text-green-600 italic">"{teacher?.bizName || teacher?.name}"</span> ha sido enviada exitosamente.</p>
                    <div className="p-4 bg-slate-50 rounded-2xl inline-block text-sm font-black text-slate-400 uppercase tracking-widest">
                        Cobralo • Feedback Estudiantil
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background circle */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 bg-green-600 text-white rounded-[24px] flex items-center justify-center mb-6 shadow-xl shadow-green-200 dark:shadow-none">
                            <Star size={40} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white text-center tracking-tight leading-none px-4 mb-2 uppercase">
                            Calificá tu experiencia
                        </h1>
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-center text-sm">
                            con {teacher?.bizName || teacher?.name}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Rating Selection */}
                        <div className="flex flex-col items-center space-y-4">
                            <label className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Puntuación</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="transform transition-all active:scale-90"
                                    >
                                        <Star
                                            size={44}
                                            className={`transition-colors duration-200 ${
                                                (hoveredRating || rating) >= star
                                                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                                    : 'text-slate-200 fill-transparent dark:text-slate-800'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-1.5">
                                <UserIcon size={12} /> Tu Nombre (Opcional)
                            </label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-green-600 rounded-2xl p-4 font-bold text-slate-700 outline-none placeholder-slate-300"
                                placeholder="Ej: Juan Pérez"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                            />
                        </div>

                        {/* Comment Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">
                                Comentario o Testimonio
                            </label>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-none focus:ring-2 focus:ring-green-600 rounded-3xl p-5 font-bold text-slate-700 outline-none placeholder-slate-300 min-h-[140px] resize-none"
                                placeholder="Contános qué te parecieron las clases..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-100 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send size={20} className="transform rotate-12" />
                                    ENVIAR CALIFICACIÓN
                                </>
                            )}
                        </button>
                        
                        <p className="text-[9px] text-slate-300 dark:text-slate-600 text-center font-bold uppercase tracking-widest">
                            Impulsado por Cobralo.cl • Sistema de Feedback
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default RateTeacher;
