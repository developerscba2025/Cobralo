import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Loader2, Award, CheckCircle2, Building2, Shield, MessageCircle, Sparkles, X, Mail, Send } from 'lucide-react';
import { floatVariants } from '../utils/motion';


/* ─── Star rating row (animated one-by-one) ────────────────────────────────── */
const AnimatedStars = ({ value, size = 20 }: { value: number; size?: number }) => (
    <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
            >
                <Star
                    size={size}
                    className={i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 fill-zinc-800/50'}
                />
            </motion.div>
        ))}
    </div>
);

/* ─── Animated counter ─────────────────────────────────────────────────────── */
const CountUp = ({ target, decimals = 0 }: { target: number; decimals?: number }) => {
    const [val, setVal] = useState(0);

    useEffect(() => {
        const duration = 1000;
        const frameTime = 1000 / 60;
        const totalFrames = Math.round(duration / frameTime);
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentVal = target * progress;
            
            if (frame >= totalFrames) {
                setVal(target);
                clearInterval(timer);
            } else {
                setVal(currentVal);
            }
        }, frameTime);

        return () => clearInterval(timer);
    }, [target]);

    return <span>{val.toFixed(decimals)}</span>;
};

/* ═══════════════════════════════════════════════════════════════════════════ */

import { useTheme } from '../context/ThemeContext';

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const { theme } = useTheme();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Contact form state
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleContact = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const response = await fetch(`/api/ratings/public/profile/${id}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });
            if (!response.ok) throw new Error('Error al enviar mensaje');
            setSent(true);
            setTimeout(() => {
                setShowContactModal(false);
                setSent(false);
                setContactData({ name: '', email: '', message: '' });
            }, 3000);
        } catch (err) {
            alert('No se pudo enviar el mensaje. Inténtalo más tarde.');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!id) return;
                const response = await fetch(`/api/ratings/public/profile/${id}`);
                if (!response.ok) throw new Error('No se pudo encontrar el profesor');
                const data = await response.json();
                setProfile(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    return (
        <div className="min-h-screen bg-bg-app text-text-main selection:bg-primary-main/30 overflow-x-hidden relative">
            {/* Standard Background (Dot Grid + Orbs) */}
            <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: theme === 'dark' ? 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)' : 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 20%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 20%, transparent 100%)',
                }}
            />
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-20"
                 style={{ background: 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen flex flex-col items-center justify-center gap-4 relative z-50 text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <Loader2 className="text-primary-main" size={48} />
                        </motion.div>
                        <p className="text-text-muted text-xs font-black uppercase tracking-[0.3em] animate-pulse">
                            Cargando perfil profesional…
                        </p>
                    </motion.div>
                ) : (error || !profile) ? (
                    <motion.div 
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen flex flex-col items-center justify-center p-6 text-center z-50"
                    >
                        <h1 className="text-3xl font-black text-text-main mb-4 uppercase italic">Vaya, algo falló</h1>
                        <p className="text-text-muted mb-8 max-w-sm">{error || 'El profesor que buscas no parece estar disponible.'}</p>
                        <Link
                            to="/"
                            className="px-8 py-3 rounded-xl bg-surface/50 dark:bg-white/5 border border-border-main dark:border-white/10 text-text-main dark:text-white font-black uppercase tracking-widest hover:bg-surface dark:hover:bg-white/10 transition-all"
                        >
                            Volver al inicio
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative z-10 w-full"
                    >
                        {/* ── Hero Gradient ────────────────────────────────────────── */}
                        <div className="h-40 bg-gradient-to-b from-primary-main/10 via-primary-main/5 to-transparent" />

                        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 pb-20">
                            {/* ── Main Profile Card ────────────────────────────────────── */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-surface/80 dark:bg-surface/80 backdrop-blur-2xl border border-border-main dark:border-white/5 rounded-[32px] overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 sm:p-10">
                                    {/* Header Section */}
                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                        {/* Avatar */}
                                        <motion.div
                                            variants={floatVariants}
                                            initial="initial"
                                            animate="animate"
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] bg-primary-main flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-xl shadow-primary-main/20 shrink-0 relative overflow-hidden"
                                        >
                                            {profile.photoUrl ? (
                                                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                                            ) : (
                                                profile.name[0].toUpperCase()
                                            )}
                                        </motion.div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-3xl md:text-5xl font-black text-text-main dark:text-white uppercase italic tracking-tighter mb-2">
                                                {profile.bizName || profile.name}
                                            </h1>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-black uppercase tracking-widest text-primary-main">
                                                <span className="flex items-center gap-2">
                                                    <Award size={14} />
                                                    {profile.businessCategory || 'Profesional'}
                                                </span>
                                                {profile.isPro && (
                                                    <span className="px-2 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-lg flex items-center gap-1.5">
                                                        <Sparkles size={12} /> PRO
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                                                <div className="flex items-center gap-2">
                                                    <AnimatedStars value={profile.avgRating} size={14} />
                                                    <span className="text-lg font-black text-text-main dark:text-white">
                                                        <CountUp target={parseFloat(profile.avgRating)} decimals={1} />
                                                    </span>
                                                </div>
                                                <div className="h-4 w-px bg-border-main dark:bg-white/10" />
                                                <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                                                    <CountUp target={profile.reviewCount} /> Reseñas
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid Content */}
                                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        {/* Testimonials */}
                                        <div className="lg:col-span-8">
                                            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                                <MessageSquare size={14} /> Testimonios Recientes
                                            </h2>

                                            {profile.ratings.length === 0 ? (
                                                <div className="p-10 rounded-3xl bg-white/[0.02] border border-dashed border-white/5 text-center">
                                                    <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No hay testimonios todavía</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {profile.ratings.map((r: any, i: number) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="p-5 bg-black/5 dark:bg-white/[0.03] rounded-2xl border border-border-main dark:border-white/5 hover:border-border-main dark:hover:border-white/10 transition-colors flex flex-col"
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex gap-1">
                                                                    {[...Array(5)].map((_, starI) => (
                                                                        <Star key={starI} size={10} className={starI < r.value ? 'fill-amber-400 text-amber-400' : 'text-zinc-800'} />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[8px] font-black text-text-muted uppercase">
                                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-text-muted dark:text-zinc-300 text-sm leading-relaxed mb-6 italic">"{r.comment}"</p>
                                                            <div className="mt-auto flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary-main/10 flex items-center justify-center text-[10px] font-black text-primary-main">
                                                                    {r.studentName[0]}
                                                                </div>
                                                                <span className="text-xs font-black text-text-main dark:text-white uppercase tracking-tight italic">{r.studentName}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sidebar */}
                                        <div className="lg:col-span-4 space-y-6">
                                            <div className="p-6 bg-black/5 dark:bg-white/[0.03] rounded-3xl border border-border-main dark:border-white/5">
                                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Verificación</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { icon: CheckCircle2, label: 'Identidad Verificada' },
                                                        { icon: Building2, label: 'Profesor Oficial' },
                                                        { icon: Shield, label: 'Cobros Protegidos' },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <item.icon size={16} className="text-primary-main" />
                                                            <span className="text-xs font-bold text-text-muted dark:text-zinc-300">{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8">
                                                    <button
                                                        onClick={() => setShowContactModal(true)}
                                                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary-main hover:bg-primary-main/90 text-black dark:text-zinc-950 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-main/20 active:scale-95"
                                                    >
                                                        <MessageCircle size={18} />
                                                        Contactar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contact Modal */}
            <AnimatePresence>
                {showContactModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowContactModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-surface dark:bg-zinc-900 border border-border-main dark:border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
                        >
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-text-muted transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {sent ? (
                                <div className="py-12 text-center">
                                    <div className="w-20 h-20 bg-primary-main/10 text-primary-main rounded-[28px] flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-text-main dark:text-white uppercase italic mb-2 tracking-tight">¡Mensaje Enviado!</h3>
                                    <p className="text-text-muted">El profesor recibirá tu correo en unos instantes.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <div className="w-14 h-14 bg-primary-main/10 text-primary-main rounded-2xl flex items-center justify-center mb-6">
                                            <Mail size={28} />
                                        </div>
                                        <h3 className="text-3xl font-black text-text-main dark:text-white uppercase italic tracking-tighter mb-2">Contactar Profe</h3>
                                        <p className="text-text-muted text-sm font-bold">Completa el formulario para enviar un correo a {profile.bizName || profile.name}.</p>
                                    </div>

                                    <form onSubmit={handleContact} className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Tu Nombre</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/10 rounded-2xl p-4 text-text-main font-bold outline-none focus:border-primary-main/30 transition-colors"
                                                placeholder="Ej: Juan Pérez"
                                                value={contactData.name}
                                                onChange={e => setContactData({ ...contactData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Tu Correo</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/10 rounded-2xl p-4 text-text-main font-bold outline-none focus:border-primary-main/30 transition-colors"
                                                placeholder="tu@email.com"
                                                value={contactData.email}
                                                onChange={e => setContactData({ ...contactData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Mensaje</label>
                                            <textarea
                                                required
                                                rows={4}
                                                className="w-full bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/10 rounded-2xl p-4 text-text-main font-bold outline-none focus:border-primary-main/30 transition-colors resize-none"
                                                placeholder="Hola, me gustaría saber más sobre tus clases..."
                                                value={contactData.message}
                                                onChange={e => setContactData({ ...contactData, message: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="w-full py-5 bg-primary-main hover:bg-primary-main/90 text-black dark:text-zinc-950 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-main/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                                        >
                                            {sending ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    Enviar Mensaje
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublicProfile;
