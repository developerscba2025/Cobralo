import React, { useState } from 'react';
import { Star, MessageSquare, Eye, EyeOff, RefreshCw, Copy, Lock } from 'lucide-react';
import { PricingModal } from '../PricingModal';
import { showToast } from '../Toast';

interface RatingsTabProps {
    ratings: any[];
    ratingToken: string | null;
    ratingExpires: string | null;
    handleGenerateLink: () => void;
    handleToggleRatingVisibility: (id: number) => void;
    isPro: boolean;
}

const RatingsTab: React.FC<RatingsTabProps> = ({ ratings, ratingToken, ratingExpires, handleGenerateLink, handleToggleRatingVisibility, isPro }) => {
    const [showPricing, setShowPricing] = useState(false);

    return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                <Star size={24} className="text-amber-500 fill-amber-500" /> 
                Testimonios
            </h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Lo que tus alumnos dicen de vos.</p>
        </div>

        <div className="bg-bg-app p-5 md:p-8 lg:p-10 rounded-[32px] md:rounded-[48px] border border-border-main">
            <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10 mb-6 lg:mb-10">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-amber-500/10 text-amber-500 rounded-[24px] lg:rounded-[32px] flex items-center justify-center">
                    <Star size={36} className="fill-current lg:hidden" />
                    <Star size={48} className="fill-current hidden lg:block" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-emerald-50 mb-2 uppercase tracking-tight">Link de Calificaciones</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm leading-relaxed max-w-md">
                        Compartí este link con tus alumnos habituales para que puedan evaluarte y dejarte feedback positivo.
                    </p>
                </div>
                <button 
                    onClick={() => {
                        if (!isPro) {
                            showToast.error('¡Actualizá tu plan a PRO para gestionar tus testimonios!');
                            setShowPricing(true);
                            return;
                        }
                        handleGenerateLink();
                    }} 
                    className={`w-full lg:w-auto font-black px-6 py-4 lg:px-8 lg:py-5 rounded-2xl lg:rounded-[24px] flex items-center justify-center gap-2 transition active:scale-95 shadow-xl uppercase tracking-widest text-[10px] ${
                        isPro 
                            ? 'bg-primary-main text-white hover:bg-green-600 shadow-primary-glow' 
                            : 'bg-zinc-100 text-zinc-400 dark:bg-bg-dark border border-border-main grayscale opacity-60'
                    }`}
                >
                    {!isPro && <Lock size={14} className="text-primary-main/60" />}
                    <RefreshCw size={18} /> Generar Nuevo Link
                </button>
            </div>

            {ratingToken && (
                <div className="p-5 md:p-8 lg:p-10 bg-surface rounded-[32px] md:rounded-[40px] border border-amber-500/20 shadow-sm border-dashed">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-2">Link Para Alumnos</label>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-bg-app p-5 rounded-[24px] font-mono text-xs font-bold text-primary-main truncate flex items-center border border-border-main">
                            {`${window.location.origin}/rate/${ratingToken}`}
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/rate/${ratingToken}`); showToast.success('Copiado'); }}
                            className="p-5 bg-primary-main/10 text-primary-main rounded-[24px] hover:bg-primary-main/20 transition-all border border-primary-main/20"
                        >
                            <Copy size={24} />
                        </button>
                    </div>
                    <p className="mt-6 text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] text-center">
                        Este link es válido hasta el {new Date(ratingExpires!).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>

        <section>
            <h3 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 mb-8 uppercase tracking-[0.2em] ml-4">Últimos Testimonios</h3>
            {ratings.length === 0 ? (
                <div className="text-center py-16 md:py-20 bg-bg-app rounded-[32px] md:rounded-[48px] border-2 border-dashed border-border-main">
                    <MessageSquare size={48} className="mx-auto mb-4 text-zinc-200" />
                    <p className="text-zinc-400 font-black uppercase tracking-tight">No hay Testimonios aún</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {ratings.map(r => (
                        <div key={r.id} className="p-5 md:p-8 bg-bg-app rounded-[32px] md:rounded-[40px] border border-border-main shadow-sm group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < r.value ? 'fill-current' : 'text-zinc-200'} />
                                    ))}
                                </div>
                                <button onClick={() => handleToggleRatingVisibility(r.id)} className={`p-2 rounded-xl transition-all ${r.showComment !== false ? 'bg-surface text-zinc-300' : 'bg-amber-500 text-white shadow-lg'}`}>
                                    {r.showComment !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                            <p className="text-text-main dark:text-zinc-300 font-bold italic mb-6 leading-relaxed">"{r.comment}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[14px] bg-primary-main/10 flex items-center justify-center text-[10px] font-black text-primary-main uppercase">
                                    {r.studentName?.[0] || 'A'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-widest">{r.studentName || 'Anónimo'}</p>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
);
}

export default RatingsTab;
