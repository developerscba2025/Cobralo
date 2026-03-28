import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Loader2, Award, CheckCircle2, Building2 } from 'lucide-react';


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
            <div className="h-48 bg-gradient-to-br from-green-950 via-[#050805] to-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-[120px]"></div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                        <div className="flex gap-6 items-center">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-green-600 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-inner">
                                {profile.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
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
                                    <span className="text-sm font-black text-white">{profile.avgRating}</span>
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-widest border-l border-white/10 pl-3">
                                        {profile.reviewCount} reseñas
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
                                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-green-500" /> Testimonios Recientes
                                </h2>
                                
                                <div className="space-y-6">
                                    {profile.ratings.length === 0 ? (
                                        <div className="p-8 rounded-[32px] bg-white/5 border border-dashed border-white/10 text-center">
                                            <p className="text-slate-500 font-bold">Aún no hay testimonios públicos.</p>
                                        </div>
                                    ) : (
                                        profile.ratings.map((r: any, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-8 bg-white/5 rounded-[32px] border border-white/5 relative group"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                size={14} 
                                                                className={i < r.value ? 'fill-amber-400 text-amber-400' : 'text-slate-800'} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase">
                                                        {new Date(r.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 font-medium italic leading-relaxed mb-4">
                                                    "{r.comment}"
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-green-500">
                                                        {r.studentName[0]}
                                                    </div>
                                                    <span className="text-xs font-black text-white uppercase tracking-tight">{r.studentName}</span>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
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
