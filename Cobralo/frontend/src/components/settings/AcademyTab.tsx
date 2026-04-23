import React, { useRef, useState } from 'react';
import { User as UserIcon, Zap, Check, Star, CreditCard, Building2, Eye, EyeOff, Lock, Trash2, Upload, ExternalLink, Instagram, Facebook, Sparkles, Share2, RefreshCw } from 'lucide-react';
import { PricingModal } from '../PricingModal';
import { showToast } from '../Toast';
import type { User } from '../../services/api';

interface AcademyTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    isPro: boolean;
    pendingAdjustment: any;
    setActiveTab: (tab: any) => void;
    studentCount: number;
    scheduleCount: number;
    hasRecentPayments: boolean;
}

const AcademyTab: React.FC<AcademyTabProps> = ({
    user, setUser,
    isPro, pendingAdjustment, setActiveTab,
    studentCount, scheduleCount, hasRecentPayments,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showPricing, setShowPricing] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast.error('Por favor selecciona una imagen válida');
            return;
        }

        setIsUploadingImage(true);

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, width, height);
                        ctx.drawImage(img, 0, 0, width, height);
                        const base64String = canvas.toDataURL('image/jpeg', 0.8);
                        setUser({ ...user, photoUrl: base64String });
                        showToast.success('Foto cargada. ¡No olvides guardar los cambios!');
                    }
                    setIsUploadingImage(false);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        } catch (error) {
            showToast.error('Error al procesar la imagen');
            setIsUploadingImage(false);
        }
    };

    const completionPercentage = Math.round(
        (isPro ? 20 : 0) + 
        (user.bizName && user.businessCategory ? 20 : 0) + 
        (studentCount >= 10 ? 20 : 0) + 
        (scheduleCount >= 4 ? 20 : 0) + 
        (hasRecentPayments ? 20 : 0)
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {pendingAdjustment && (
                <div className="group relative p-[1px] bg-gradient-to-r from-amber-500/20 via-amber-200/40 to-amber-500/20 rounded-[32px] overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/5 blur-xl animate-pulse" />
                    <div className="relative p-6 bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-sm rounded-[31px] flex flex-col md:flex-row items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                            <Zap size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest">Ajuste Inflacionario Próximo</h3>
                            <p className="text-xs font-bold text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                                El {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()} se aplicará un ajuste del **{pendingAdjustment.percentage}%** (IPC).
                            </p>
                        </div>
                        <button onClick={() => setActiveTab('legal')} className="px-6 py-3 bg-amber-900 text-amber-100 dark:bg-amber-500 dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-amber-900/10 active:scale-95">Ver Términos</button>
                    </div>
                </div>
            )}

            {/* Visibility Card - The Bento Masterpiece */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-primary-main/10 to-emerald-500/20 rounded-[48px] blur-xl opacity-25 group-hover:opacity-40 transition-all duration-1000" />
                <div className="relative p-8 md:p-12 bg-surface dark:bg-bg-soft border border-zinc-200 dark:border-border-main rounded-[48px] shadow-2xl overflow-hidden">
                    {/* Background Texture */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.1] -mr-16 -mt-16 text-emerald-500 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                        <Sparkles size={300} strokeWidth={1} />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-16 items-start relative z-10">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Estado de Visibilidad</span>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 dark:text-emerald-50 leading-[1.1] tracking-tighter uppercase italic">
                                    Potenciá tu <br /> <span className="text-emerald-500">Marca Personal</span>
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest max-w-sm">
                                    Completá los objetivos para aumentar tu ranking en la plataforma Cobralo.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Puntaje de Perfil</span>
                                    <span className="text-4xl font-black text-emerald-500 font-mono tracking-tighter">
                                        {completionPercentage}%
                                    </span>
                                </div>
                                <div className="h-6 w-full bg-zinc-100 dark:bg-white/5 rounded-2xl overflow-hidden p-1.5 border border-zinc-200 dark:border-white/5">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-xl transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.4)] relative"
                                        style={{ width: `${completionPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[400px] grid grid-cols-1 gap-3">
                            {[
                                { label: 'Suscripción Pro', active: isPro, icon: Zap },
                                { label: 'Identidad Visual Completa', active: !!(user.bizName && user.businessCategory), icon: UserIcon },
                                { label: 'Base de Alumnos (+10)', active: studentCount >= 10, count: studentCount, target: 10, icon: UserIcon },
                                { label: 'Agenda Organizada', active: scheduleCount >= 4, count: scheduleCount, target: 4, icon: Star },
                                { label: 'Actividad Económica', active: hasRecentPayments, icon: CreditCard },
                            ].map((item, i) => (
                                <div 
                                    key={i} 
                                    className={`flex items-center gap-5 p-5 rounded-[24px] border transition-all duration-500 ${
                                        item.active 
                                        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5 scale-[1.02]' 
                                        : 'bg-zinc-50/50 dark:bg-white/5 border-zinc-100 dark:border-white/5 grayscale opacity-50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.active ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-surface dark:bg-bg-app text-zinc-400'}`}>
                                        {item.active ? <Check size={20} strokeWidth={3} /> : <item.icon size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-zinc-900 dark:text-emerald-50' : 'text-zinc-400'}`}>{item.label}</p>
                                        {(item as any).target && (
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((item as any).count / (item as any).target) * 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-zinc-400 font-mono">{(item as any).count}/{(item as any).target}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Visibility Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-zinc-200 dark:border-white/5">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 tracking-tight uppercase">
                        <Building2 size={28} className="text-emerald-500" /> Identidad Pública
                    </h2>
                    <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Gestioná cómo te ven tus futuros alumnos.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (!isPro) {
                                showToast.error('¡Actualizá tu plan a PRO para cambiar la visibilidad de tu perfil!');
                                setShowPricing(true);
                                return;
                            }
                            setUser({ ...user, isPublicProfileVisible: !user.isPublicProfileVisible });
                        }}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border ${
                            !isPro 
                                ? 'bg-zinc-50 dark:bg-white/5 text-zinc-300 border-zinc-200 dark:border-white/5 cursor-not-allowed' 
                                : user.isPublicProfileVisible 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-white/5 dark:text-zinc-600'
                        }`}
                    >
                        {!isPro && <Lock size={14} className="text-emerald-500/50" />}
                        {user.isPublicProfileVisible ? <><Eye size={18} strokeWidth={2.5} /> Perfil Público</> : <><EyeOff size={18} strokeWidth={2.5} /> Perfil Oculto</>}
                    </button>
                    
                    <button 
                        onClick={() => { 
                            if (!isPro) {
                                showToast.error('¡Actualizá tu plan a PRO para compartir tu perfil!');
                                setShowPricing(true);
                                return;
                            }
                            const profileId = user.bizAlias || user.id;
                            if (profileId) {
                                navigator.clipboard.writeText(`${window.location.origin}/profile/${profileId}`); 
                                showToast.success('¡Enlace copiado!'); 
                            }
                        }}
                        className={`p-4 rounded-2xl border transition-all ${
                            isPro 
                            ? 'bg-surface dark:bg-bg-soft text-zinc-900 dark:text-emerald-50 border-zinc-200 dark:border-border-main hover:border-emerald-500 shadow-xl shadow-black/5 hover:-translate-y-1' 
                            : 'bg-zinc-50 dark:bg-white/5 text-zinc-200 dark:border-white/5 cursor-not-allowed'
                        }`}
                        title="Compartir Perfil"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Form Bento Layout */}
            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                
                {/* Left Side: Text Fields */}
                <div className="bg-surface dark:bg-bg-soft/40 p-8 lg:p-12 rounded-[40px] border border-zinc-200 dark:border-border-main space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/80 uppercase tracking-[0.2em] ml-2">Nombre Comercial</label>
                            <input 
                                type="text" 
                                disabled={!isPro} 
                                className={`w-full p-6 bg-white dark:bg-black/40 text-zinc-900 dark:text-emerald-50 rounded-2xl border border-zinc-200 dark:border-white/5 font-black text-base shadow-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-zinc-300 ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                value={user.bizName || ''} 
                                onChange={e => setUser({ ...user, bizName: e.target.value })} 
                                placeholder="Nombre de tu negocio" 
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/80 uppercase tracking-[0.2em] ml-2">Especialidad</label>
                            <input 
                                type="text" 
                                disabled={!isPro} 
                                className={`w-full p-6 bg-white dark:bg-black/40 text-zinc-900 dark:text-emerald-50 rounded-2xl border border-zinc-200 dark:border-white/5 font-black text-base shadow-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-zinc-300 ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                value={user.businessCategory || ''} 
                                onChange={e => setUser({ ...user, businessCategory: e.target.value })} 
                                placeholder="Rubro o tipo de actividad" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/80 uppercase tracking-[0.2em] ml-2">Propuesta de Valor (Biografía)</label>
                        <textarea 
                            disabled={!isPro} 
                            className={`w-full p-8 bg-white dark:bg-black/40 text-zinc-900 dark:text-emerald-50 rounded-[32px] border border-zinc-200 dark:border-white/5 font-bold text-base shadow-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none min-h-[180px] transition-all placeholder:text-zinc-300 leading-relaxed ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`} 
                            value={user.biography || ''} 
                            onChange={e => setUser({ ...user, biography: e.target.value })} 
                            placeholder="Contanos qué hace que tu academia sea única. Esta descripción se verá en tu landing page..." 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/80 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Instagram size={14} className="text-emerald-500" /> Instagram</label>
                            <input type="text" disabled={!isPro} className={`w-full p-5 bg-white dark:bg-black/40 text-zinc-900 dark:text-emerald-50 rounded-2xl border border-zinc-200 dark:border-white/5 font-bold outline-none focus:border-emerald-500/30 transition-all ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`} value={user.instagramUrl || ''} onChange={e => setUser({ ...user, instagramUrl: e.target.value })} placeholder="@usuario" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/80 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Facebook size={14} className="text-emerald-500" /> Facebook</label>
                            <input type="text" disabled={!isPro} className={`w-full p-5 bg-white dark:bg-black/40 text-zinc-900 dark:text-emerald-50 rounded-2xl border border-zinc-200 dark:border-white/5 font-bold outline-none focus:border-emerald-500/30 transition-all ${!isPro ? 'opacity-50 cursor-not-allowed' : ''}`} value={user.facebookUrl || ''} onChange={e => setUser({ ...user, facebookUrl: e.target.value })} placeholder="fb.com/academia" />
                        </div>
                    </div>
                </div>

                {/* Right Side: Photo + Visuals */}
                <div className="space-y-8">
                    {/* Image Upload Card */}
                    <div className="bg-surface dark:bg-bg-soft p-8 rounded-[40px] border border-zinc-200 dark:border-border-main shadow-2xl space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                        
                        <div className="space-y-1 relative z-10">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Protocolo Visual</h3>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Logo / Identidad Corporativa</p>
                        </div>

                        <div className="flex flex-col items-center gap-8 relative z-10">
                            <div 
                                className={`relative group/photo overflow-hidden ${isPro ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onClick={() => isPro && fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-primary-main rounded-[40px] blur opacity-20 group-hover/photo:opacity-40 transition duration-500"></div>
                                <div className="relative w-48 h-48 rounded-[36px] bg-zinc-100 dark:bg-bg-app flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-border-main shadow-2xl transition-transform group-hover/photo:scale-[1.03]">
                                    {user.photoUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={user.photoUrl} alt="Preview" className="w-full h-full object-cover group-hover/photo:opacity-40 transition-opacity" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isPro) return;
                                                    setUser({ ...user, photoUrl: '' });
                                                    showToast.success('Identidad eliminada');
                                                }}
                                                className={`absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-2xl transform translate-y-4 opacity-0 group-hover/photo:translate-y-0 ${isPro ? 'group-hover/photo:opacity-100 transition-all hover:bg-red-600 active:scale-95' : 'hidden'} z-40`}
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ) : (
                                        <UserIcon size={64} className="text-zinc-700 group-hover/photo:opacity-20 transition-opacity" />
                                    )}
                                    
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/photo:opacity-100 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] transition-all">
                                        {isUploadingImage ? (
                                            <RefreshCw size={24} className="animate-spin text-white" />
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-emerald-500 mb-3" />
                                                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] text-center px-4">Subir Identidad</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Enlace de Imagen</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            disabled={!isPro}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-12 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700" 
                                            value={user.photoUrl || ''} 
                                            onChange={e => setUser({ ...user, photoUrl: e.target.value })} 
                                            placeholder="URL del logo..." 
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700">
                                            <ExternalLink size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isPro && (
                            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-relaxed flex items-center justify-center gap-2">
                                    <Zap size={14} fill="currentColor" /> Función Exclusiva PRO
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Bento */}
                    <div className="bg-surface dark:bg-bg-soft/40 p-6 rounded-[32px] border border-zinc-200 dark:border-border-main flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-black flex items-center justify-center text-emerald-500 shadow-sm">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Alumnos</p>
                                <p className="text-lg font-black text-zinc-900 dark:text-emerald-50 font-mono tracking-tighter">{studentCount}</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 dark:bg-white/10" />
                        <div className="flex items-center gap-4 text-right">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Eventos</p>
                                <p className="text-lg font-black text-zinc-900 dark:text-emerald-50 font-mono tracking-tighter">{scheduleCount}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-surface dark:bg-bg-app flex items-center justify-center text-emerald-500 shadow-sm border border-zinc-100 dark:border-border-main">
                                <Star size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </div>
    );
};

export default AcademyTab;

