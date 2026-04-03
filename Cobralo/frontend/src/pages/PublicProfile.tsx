import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Loader2, Award, CheckCircle2, Building2 } from 'lucide-react';
import { staggerContainerVariants, listItemVariants, floatVariants } from '../utils/motion';


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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050805] flex items-center justify-center">
                <Loader2 className="animate-spin text-green-500" size={32} />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#050805] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-black text-white mb-4">¡Ups! Algo salió mal.</h1>
                <p className="text-slate-400 mb-8">{error || 'El perfil no existe.'}</p>
                <Link to="/" className="btn btn-primary bg-green-600 px-6 py-3 rounded-xl text-white font-bold">
                    Volver al inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050805] text-slate-200 selection:bg-green-500/30">
            {/* Header / Banner */}
            <div className="h-56 bg-gradient-to-br from-green-950 via-[#050805] to-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2] 
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px]"
                    ></motion.div>
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.1, 0.3, 0.1] 
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]"
                    ></motion.div>
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 100 }}
                    className="bg-slate-900/40 backdrop-blur-[40px] border border-white/10 rounded-[48px] p-10 md:p-14 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)]"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <motion.div 
                                variants={floatVariants}
                                initial="initial"
                                animate="animate"
                                className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-5xl md:text-6xl font-black shadow-[0_20px_40px_-10px_rgba(34,197,94,0.4)] ring-4 ring-white/10"
                            >
                                {profile.name[0].toUpperCase()}
                            </motion.div>
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic font-accent leading-none mb-2">
                                    {profile.bizName || profile.name}
                                </h1>
                                <p className="text-green-500 font-bold flex items-center gap-2 mt-1">
                                    <Award size={18} /> {profile.businessCategory || 'Profesional'}
                                </p>
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={18} 
                                                className={i < Math.round(profile.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-800'} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-base font-black text-white">{profile.avgRating}</span>
                                    <span className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] border-l border-white/10 pl-4 py-1">
                                        {profile.reviewCount} <span className="opacity-60">reseñas</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-95">
                                Contactar
                            </button>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Summary */}
                        <div className="lg:col-span-8 space-y-12">
                            <section>
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3 font-accent">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <MessageSquare size={16} className="text-green-500" />
                                    </div> 
                                    Testimonios Recientes
                                </h2>
                                
                                <motion.div 
                                    variants={staggerContainerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {profile.ratings.length === 0 ? (
                                        <div className="col-span-full p-12 rounded-[40px] bg-white/5 border border-dashed border-white/10 text-center">
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs opacity-50">Aún no hay testimonios públicos.</p>
                                        </div>
                                    ) : (
                                        profile.ratings.map((r: any, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                variants={listItemVariants}
                                                className="p-10 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/5 hover:border-green-500/30 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                size={16} 
                                                                className={i < r.value ? 'fill-amber-400 text-amber-400' : 'text-slate-800'} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                        {new Date(r.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-200 text-lg font-medium italic leading-relaxed mb-8 opacity-90">
                                                    "{r.comment}"
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-xs font-black text-green-500 ring-1 ring-white/5">
                                                        {r.studentName[0]}
                                                    </div>
                                                    <span className="text-sm font-black text-white uppercase tracking-tight font-accent">{r.studentName}</span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </motion.div>
                            </section>
                        </div>

                        {/* Sidebar info */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="p-8 bg-white/5 rounded-[32px] border border-white/5">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Sobre el negocio</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span>Verificado por Cobralo</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                            <Building2 size={16} />
                                        </div>
                                        <span>Plan PRO</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
                
                <div className="mt-12 text-center">
                    <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                        Potenciado por <span className="text-green-500 italic">COBRALO</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
