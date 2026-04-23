import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Send, User as UserIcon, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RateTeacher = () => {
    const { token } = useParams<{ token: string }>();
    const [teacher, setTeacher] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
            await api.submitRating(token, { value: rating, comment, studentName });
            setSuccess(true);
        } catch (err) {
            setError('Error al enviar la calificación.');
        } finally {
            setSubmitting(false);
        }
    };

    const ratingLabels: Record<number, string> = {
        1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Muy bueno', 5: '¡Excelente!'
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-app flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-primary-main/30 border-t-primary-main rounded-full animate-spin" />
                    <p className="text-text-muted text-xs font-black uppercase tracking-[0.2em]">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-bg-app flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center relative z-10"
                >
                    <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                        <Star size={44} className="text-red-400" />
                    </div>
                    <h1 className="text-3xl font-black text-text-main mb-4 tracking-tight uppercase">Link inválido</h1>
                    <p className="text-text-muted font-medium mb-8 leading-relaxed">{error}</p>
                    <p className="text-[10px] text-primary-main font-black uppercase tracking-[0.2em]">Solicitale un nuevo link a tu profe.</p>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-bg-app flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-main/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="max-w-md w-full text-center relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                        className="w-28 h-28 bg-primary-main/10 border-2 border-primary-main/20 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-main/20"
                    >
                        <Heart size={56} className="text-primary-main fill-primary-main" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-text-main mb-3 tracking-tight uppercase">¡Gracias!</h1>
                    <p className="text-text-muted font-medium text-lg leading-relaxed mb-10">
                        Tu testimonio para <span className="text-primary-main font-black">"{teacher?.bizName || teacher?.name}"</span> fue enviado con éxito.
                    </p>

                    {/* Stars display */}
                    <div className="flex justify-center gap-2 mb-10">
                        {[1,2,3,4,5].map(s => (
                            <Star key={s} size={28} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/5'} />
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                        <Sparkles size={14} className="text-primary-main" />
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cobralo · Feedback Estudiantil</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-app flex items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Advanced Mesh Gradient Background - Intense Cobralo Greens (Static) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Deep Base Green Glow */}
                <div className="absolute inset-0 bg-[#0E1113]" />
                
                {/* Main Emerald Aurora */}
                <div 
                    className="absolute -top-[10%] -right-[5%] w-[1200px] h-[1200px] rounded-full opacity-20" 
                    style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 60%)', filter: 'blur(90px)' }} 
                />
                
                {/* Secondary Teal Glow */}
                <div 
                    className="absolute -bottom-[10%] -left-[5%] w-[1000px] h-[1000px] rounded-full opacity-15" 
                    style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 60%)', filter: 'blur(100px)' }} 
                />

                {/* Center Accent Glow */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" 
                    style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, transparent 50%)', filter: 'blur(120px)' }} 
                />

                {/* Subtle Grid / Texture */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ 
                        backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`, 
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
                    }} 
                />
            </div>

            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header card - Matches Login Style */}
                <div className="bg-surface/80 dark:bg-black/40 backdrop-blur-3xl border border-border-main dark:border-white/[0.08] rounded-[40px] p-8 mb-4 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-main/50 to-transparent" />
                    
                    <div className="w-20 h-20 bg-primary-main/10 border border-primary-main/20 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl relative group">
                        <div className="absolute inset-0 bg-primary-main/20 blur-xl rounded-full opacity-50" />
                        <Star size={40} className="text-primary-main fill-primary-main relative z-10" />
                    </div>
                    
                    <h1 className="text-2xl font-black text-text-main uppercase tracking-tight leading-none mb-2">
                        Calificá tu experiencia
                    </h1>
                    <p className="text-text-muted font-medium text-sm">
                        con <span className="text-primary-main font-black">{teacher?.bizName || teacher?.name}</span>
                    </p>
                </div>

                {/* Form card - Matches Login Style */}
                <form onSubmit={handleSubmit} className="bg-surface/80 dark:bg-black/45 backdrop-blur-[40px] border border-white/[0.08] rounded-[40px] p-8 shadow-2xl space-y-8 relative group/form">
                    {/* Inner subtle glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-main/[0.02] to-transparent pointer-events-none rounded-[40px]" />
                    
                    {/* Star Rating */}
                    <div className="flex flex-col items-center space-y-4 relative z-10">
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    whileTap={{ scale: 0.85 }}
                                    whileHover={{ scale: 1.15 }}
                                    className="transition-colors"
                                >
                                    <Star
                                        size={44}
                                        className={`transition-all duration-300 ${
                                            (hoveredRating || rating) >= star
                                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                                                : 'text-white/[0.05] fill-transparent'
                                        }`}
                                    />
                                </motion.button>
                            ))}
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={hoveredRating || rating}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em] drop-shadow-sm"
                            >
                                {ratingLabels[hoveredRating || rating]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Name */}
                    <div className="space-y-2 relative z-10">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                            <UserIcon size={11} className="text-primary-main" /> Tu nombre (opcional)
                        </label>
                        <input
                            type="text"
                            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-primary-main/50 focus:ring-1 focus:ring-primary-main/20 rounded-2xl p-4 font-bold text-text-main outline-none placeholder:text-text-muted/40 transition-all text-sm"
                            placeholder="Tu nombre"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                        />
                    </div>

                    {/* Comment */}
                    <div className="space-y-2 relative z-10">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">
                            Tu testimonio
                        </label>
                        <textarea
                            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-primary-main/50 focus:ring-1 focus:ring-primary-main/20 rounded-[32px] p-6 font-medium text-text-main outline-none placeholder:text-text-muted/40 min-h-[160px] resize-none transition-all leading-relaxed text-sm"
                            placeholder="Contános qué te parecieron las clases..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !comment.trim()}
                        className="group/btn w-full bg-gradient-to-r from-primary-main via-emerald-500 to-green-600 disabled:opacity-40 text-black font-black py-5 rounded-2xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-[0.15em] text-xs relative overflow-hidden"
                    >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-20deg] -translate-x-[150%] group-hover/btn:translate-x-[250%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                        
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <div className="flex items-center gap-3 relative z-10">
                                <Send size={16} strokeWidth={3} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                Enviar Calificación
                            </div>
                        )}
                    </button>

                    <p className="text-[10px] text-text-muted/50 text-center font-black uppercase tracking-[0.2em] pt-2">
                        Cobralo • Feedback Estudiantil
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default RateTeacher;
