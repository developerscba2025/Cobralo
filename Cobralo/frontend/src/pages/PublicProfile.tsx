import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Loader2, Award, CheckCircle2, Building2, Shield, MessageCircle } from 'lucide-react';
import { floatVariants } from '../utils/motion';

/* ─── Local animation helpers ──────────────────────────────────────────────── */
const fadeUp = {
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
};

const fadeIn = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1 },
};

const slideRight = {
    hidden:  { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
};

const slideLeft = {
    hidden:  { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
};

/** Wrapper that animates its children on mount with a delay */
const RevealSection = ({
    children,
    variants = fadeUp,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    variants?: Record<string, Record<string, number | string>>;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
        className={className}
    >
        {children}
    </motion.div>
);

/* ─── Star rating row (animated one-by-one) ────────────────────────────────── */
const AnimatedStars = ({ value, size = 20 }: { value: number; size?: number }) => (
    <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
            >
                <Star
                    size={size}
                    className={i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-border-main fill-border-main/50'}
                />
            </motion.div>
        ))}
    </div>
);

/* ─── Animated counter ─────────────────────────────────────────────────────── */
const CountUp = ({ target, decimals = 0 }: { target: number; decimals?: number }) => {
    const [val, setVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const step = target / 40;
        const interval = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(interval); }
            else setVal(start);
        }, 30);
        return () => clearInterval(interval);
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

    /* Loading state */
    if (loading) {
        return (
            <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 className="text-primary-main" size={52} />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="text-text-muted text-sm font-bold uppercase tracking-widest"
                >
                    Cargando perfil…
                </motion.p>
            </div>
        );
    }

    /* Error state */
    if (error || !profile) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-h-screen bg-bg-app flex flex-col items-center justify-center p-6 text-center"
                >
                    <h1 className="text-3xl lg:text-4xl font-black text-text-main mb-6">¡Ups! Algo salió mal.</h1>
                    <p className="text-text-muted text-lg mb-10">{error || 'El perfil no existe.'}</p>
                    <Link
                        to="/"
                        className="px-8 py-4 rounded-xl bg-primary-main text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary-glow"
                    >
                        Volver al inicio
                    </Link>
                </motion.div>
            </AnimatePresence>
        );
    }

    /* ─── Main render ─────────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-bg-app text-text-main selection:bg-primary-main/30 overflow-x-hidden">

            {/* ── Hero banner ──────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="h-36 bg-gradient-to-br from-primary-main/20 via-bg-app to-bg-dark relative overflow-hidden"
            >
                <div className="absolute inset-0 opacity-30">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary-main/20 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 2 }}
                        className="absolute -bottom-32 -left-32 w-[700px] h-[700px] bg-primary-main/10 rounded-full blur-[120px]"
                    />
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 dark:opacity-5" />
            </motion.div>

            {/* ── Content ──────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-8">

                {/* ── Profile card ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 48 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 90, delay: 0.1 }}
                    className="bg-surface/80 backdrop-blur-3xl border border-border-main rounded-[32px] p-4 sm:p-6 md:p-8 shadow-2xl"
                >
                    {/* Header row */}
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex flex-col md:flex-row gap-8 items-center w-full">

                            {/* Avatar */}
                            <motion.div
                                variants={floatVariants}
                                initial="initial"
                                animate="animate"
                                className="w-20 h-20 md:w-24 md:h-24 rounded-[24px] bg-primary-main flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-lg shadow-primary-glow ring-4 ring-bg-app overflow-hidden shrink-0"
                            >
                                {profile.photoUrl ? (
                                    <img src={profile.photoUrl} alt={profile.bizName || profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    profile.name[0].toUpperCase()
                                )}
                            </motion.div>

                            {/* Name + meta */}
                            <div className="text-center md:text-left flex-1 min-w-0">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    className="text-2xl sm:text-3xl md:text-4xl font-black text-text-main tracking-tighter uppercase italic font-accent mb-2"
                                >
                                    <span className="break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                        {profile.bizName || profile.name}
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.38, duration: 0.45 }}
                                    className="text-primary-main text-sm font-bold flex items-center justify-center md:justify-start gap-2 mt-1"
                                >
                                    <Award size={20} /> {profile.businessCategory || 'Profesional'}
                                </motion.p>

                                {/* Stars row */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center md:justify-start gap-2 mt-3"
                                >
                                    <AnimatedStars value={profile.avgRating} size={16} />
                                    <span className="text-base font-black text-text-main">
                                        <CountUp target={parseFloat(profile.avgRating)} decimals={1} />
                                    </span>
                                    <span className="text-xs md:text-sm text-text-muted uppercase font-black tracking-[0.2em] border-l border-border-main pl-4 py-1">
                                        <CountUp target={profile.reviewCount} /> reseñas
                                    </span>
                                </motion.div>
                            </div>
                        </div>

                    </div>

                    {/* ── Body grid ──────────────────────────────────────────── */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

                        {/* Testimonials column */}
                        <div className="lg:col-span-8 space-y-12">
                            <RevealSection variants={fadeUp} delay={0}>
                                <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-4 flex items-center gap-2 font-accent">
                                    <motion.div
                                        whileHover={{ rotate: 15, scale: 1.15 }}
                                        className="w-7 h-7 rounded-full bg-primary-main/10 flex items-center justify-center cursor-default"
                                    >
                                        <MessageSquare size={14} className="text-primary-main" />
                                    </motion.div>
                                    Testimonios Recientes
                                </h2>

                                {profile.ratings.length === 0 ? (
                                    <RevealSection variants={fadeIn} delay={0.1}>
                                        <div className="p-12 rounded-[40px] bg-bg-soft border border-dashed border-border-main text-center">
                                            <p className="text-text-muted font-bold uppercase tracking-widest text-xs lg:text-sm opacity-50">
                                                Aún no hay testimonios públicos.
                                            </p>
                                        </div>
                                    </RevealSection>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                                        {profile.ratings.map((r: any, idx: number) => (
                                            <RevealSection key={idx} variants={fadeUp} delay={idx * 0.07} className="h-full">
                                                <motion.div
                                                    whileHover={{ y: -4, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                                    className="p-4 lg:p-5 bg-surface rounded-[24px] border border-border-main hover:border-primary-main/30 transition-colors group h-full flex flex-col shadow-sm"
                                                >
                                                    {/* Stars + date */}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex gap-1.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={14}
                                                                    className={i < r.value ? 'fill-amber-400 text-amber-400' : 'text-border-main fill-border-main/20'}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest">
                                                            {new Date(r.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {/* Quote */}
                                                    <p className="text-text-main text-sm font-medium italic leading-relaxed mb-4 flex-1 opacity-90">
                                                        "{r.comment}"
                                                    </p>

                                                    {/* Author */}
                                                    <div className="flex items-center gap-3 mt-auto">
                                                        <motion.div
                                                            whileHover={{ scale: 1.12 }}
                                                            className="w-8 h-8 rounded-xl bg-bg-app border border-border-main flex items-center justify-center text-xs font-black text-primary-main"
                                                        >
                                                            {r.studentName[0]}
                                                        </motion.div>
                                                        <span className="text-sm md:text-base font-black text-text-main uppercase tracking-tight font-accent">
                                                            {r.studentName}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            </RevealSection>
                                        ))}
                                    </div>
                                )}
                            </RevealSection>
                        </div>

                        {/* Sidebar */}
                        <RevealSection variants={slideLeft} delay={0.15} className="lg:col-span-4 space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                                className="p-4 lg:p-5 bg-surface rounded-[20px] border border-border-main shadow-sm"
                            >
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">
                                    Sobre el negocio
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: CheckCircle2, label: 'Verificado por Cobralo' },
                                        { icon: Building2,    label: 'Plan PRO Activo' },
                                        { icon: Shield,       label: 'Pagos seguros' },
                                    ].map(({ icon: Icon, label }, i) => (
                                        <RevealSection key={label} variants={slideRight} delay={i * 0.1}>
                                            <div className="flex items-center gap-4 text-text-main">
                                                <motion.div
                                                    whileHover={{ rotate: 8, scale: 1.12 }}
                                                    className="w-8 h-8 rounded-full bg-primary-main/10 flex items-center justify-center text-primary-main shrink-0 cursor-default"
                                                >
                                                    <Icon size={16} />
                                                </motion.div>
                                                <span className="font-bold text-sm">{label}</span>
                                            </div>
                                        </RevealSection>
                                    ))}
                                </div>
                                <div className="pt-6 mt-6 border-t border-border-main/50">
                                    <a
                                        href={profile.phone ? `https://wa.me/${profile.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quiero consultar por tus clases!')}` : '#'}
                                        target="_blank" rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary-main hover:bg-primary-main/90 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-main/20 hover:scale-[1.02] active:scale-95"
                                        onClick={(e) => {
                                            if (!profile.phone) {
                                                e.preventDefault();
                                                alert("Este profesional aún no configuró su número de contacto.");
                                            }
                                        }}
                                    >
                                        <MessageCircle size={18} />
                                        Contactar
                                    </a>
                                </div>
                            </motion.div>
                        </RevealSection>

                    </div>
                </motion.div>

               
            </div>
        </div>
    );
};

export default PublicProfile;
