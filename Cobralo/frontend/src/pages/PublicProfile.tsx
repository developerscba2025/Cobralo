import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Loader2, Award, CheckCircle2, Building2, Shield, MessageCircle, Sparkles } from 'lucide-react';
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

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        <div className="min-h-screen bg-[#0E1113] text-text-main selection:bg-primary-main/30 overflow-x-hidden relative">
            {/* Standard Background (Dot Grid + Orbs) */}
            <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
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
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
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
                        <h1 className="text-3xl font-black text-white mb-4 uppercase italic">Vaya, algo falló</h1>
                        <p className="text-zinc-500 mb-8 max-w-sm">{error || 'El profesor que buscas no parece estar disponible.'}</p>
                        <Link
                            to="/"
                            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
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
                                className="bg-[#16191C]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl"
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
                                            <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
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
                                                    <span className="text-lg font-black text-white">
                                                        <CountUp target={parseFloat(profile.avgRating)} decimals={1} />
                                                    </span>
                                                </div>
                                                <div className="h-4 w-px bg-white/10" />
                                                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                                    <CountUp target={profile.reviewCount} /> Reseñas
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid Content */}
                                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        {/* Testimonials */}
                                        <div className="lg:col-span-8">
                                            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
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
                                                            className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col"
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex gap-1">
                                                                    {[...Array(5)].map((_, starI) => (
                                                                        <Star key={starI} size={10} className={starI < r.value ? 'fill-amber-400 text-amber-400' : 'text-zinc-800'} />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[8px] font-black text-zinc-600 uppercase">
                                                                    {new Date(r.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic">"{r.comment}"</p>
                                                            <div className="mt-auto flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary-main/10 flex items-center justify-center text-[10px] font-black text-primary-main">
                                                                    {r.studentName[0]}
                                                                </div>
                                                                <span className="text-xs font-black text-white uppercase tracking-tight italic">{r.studentName}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sidebar */}
                                        <div className="lg:col-span-4 space-y-6">
                                            <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Verificación</h3>
                                                <div className="space-y-4">
                                                    {[
                                                        { icon: CheckCircle2, label: 'Identidad Verificada' },
                                                        { icon: Building2, label: 'Profesor Oficial' },
                                                        { icon: Shield, label: 'Cobros Protegidos' },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <item.icon size={16} className="text-primary-main" />
                                                            <span className="text-xs font-bold text-zinc-300">{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-8">
                                                    <a
                                                        href={profile.phone ? `https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola!')}` : '#'}
                                                        target="_blank" rel="noreferrer"
                                                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary-main hover:bg-primary-main/90 text-[#0E1113] rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-main/20 active:scale-95"
                                                    >
                                                        <MessageCircle size={18} />
                                                        Contactar
                                                    </a>
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
        </div>
    );
};

export default PublicProfile;
