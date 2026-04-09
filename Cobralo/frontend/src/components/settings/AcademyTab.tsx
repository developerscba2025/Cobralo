import React, { useRef, useState } from 'react';
import { User as UserIcon, Zap, Check, Star, CreditCard, Building2, Eye, EyeOff, Lock, Trash2, Upload, ExternalLink, Instagram, Facebook } from 'lucide-react';
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
            // Read file and compress to base64
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

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl transition-all">
            {pendingAdjustment && (
                <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-[32px] flex flex-col md:flex-row items-center gap-6 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0"><Zap size={24} /></div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Próximo Ajuste por Inflación (IPC)</h3>
                        <p className="text-xs font-bold text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                            Según nuestros términos, el próximo {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()} los planes se ajustarán un **{pendingAdjustment.percentage}%**.
                        </p>
                    </div>
                    <button onClick={() => setActiveTab('legal')} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20">Ver Términos</button>
                </div>
            )}

            {/* Visibility card */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-main/20 via-amber-400/20 to-primary-main/20 rounded-[48px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative p-4 md:p-6 lg:p-8 bg-surface rounded-[32px] md:rounded-[48px] border border-border-main shadow-xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-10 items-center">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-primary-main/10 border border-primary-main/20 text-[10px] font-black text-primary-main uppercase tracking-widest">Estado: Landing Page</div>
                                {isPro && <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">Habilitado Pro</div>}
                            </div>
                            <h2 className="text-xl lg:text-3xl font-black text-zinc-900 dark:text-emerald-50 leading-tight uppercase">Tu camino a ser <span className="text-primary-main underline decoration-primary-main/20">Destacado</span></h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nivel de Visibilidad</span>
                                    <span className="text-2xl font-black text-primary-main font-mono">
                                        {Math.round((isPro ? 20 : 0) + (user.bizName && user.businessCategory ? 20 : 0) + (studentCount >= 10 ? 20 : 0) + (scheduleCount >= 4 ? 20 : 0) + (hasRecentPayments ? 20 : 0))}%
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-zinc-100 dark:bg-bg-soft rounded-full overflow-hidden p-1 border border-zinc-200/50 dark:border-white/5">
                                    <div className="h-full bg-gradient-to-r from-primary-main to-emerald-400 rounded-full transition-all duration-1000 shadow-lg shadow-primary-glow"
                                        style={{ width: `${(isPro ? 20 : 0) + (user.bizName && user.businessCategory ? 20 : 0) + (studentCount >= 10 ? 20 : 0) + (scheduleCount >= 4 ? 20 : 0) + (hasRecentPayments ? 20 : 0)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-80 grid grid-cols-1 gap-2">
                            {[
                                { label: 'Suscripción Pro Activa', active: isPro, icon: Zap },
                                { label: 'Perfil Completo (Nombre/Bio)', active: !!(user.bizName && user.businessCategory), icon: UserIcon },
                                { label: '10+ Alumnos Activos', active: studentCount >= 10, count: studentCount, target: 10, icon: UserIcon },
                                { label: 'Calendario Configurado', active: scheduleCount >= 4, count: scheduleCount, target: 4, icon: Star },
                                { label: 'Cobro Registrado (30 días)', active: hasRecentPayments, icon: CreditCard },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.active ? 'bg-primary-main/[0.03] border-primary-main/10' : 'bg-zinc-50/50 dark:bg-bg-soft/20 border-transparent grayscale opacity-60'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.active ? 'bg-primary-main text-white' : 'bg-surface text-zinc-400'}`}>
                                        {item.active ? <Check size={16} /> : <item.icon size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${item.active ? 'text-zinc-800 dark:text-emerald-50' : 'text-zinc-400'}`}>{item.label}</p>
                                        {(item as any).target && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-1 flex-1 bg-surface rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary-main" style={{ width: `${Math.min(100, ((item as any).count / (item as any).target) * 100)}%` }} />
                                                </div>
                                                <span className="text-[8px] font-black text-zinc-400">{(item as any).count}/{(item as any).target}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                        <Building2 size={24} className="text-primary-main" /> Mi Marca
                    </h2>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Gestioná tu academia y perfil público.</p>
                </div>
                <button
                    onClick={() => {
                        if (!isPro) {
                            showToast.error('¡Actualizá tu plan a PRO para cambiar la visibilidad de tu perfil!');
                            setShowPricing(true);
                            return;
                        }
                        setUser({ ...user, isPublicProfileVisible: !user.isPublicProfileVisible });
                    }}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 border ${
                        !isPro 
                            ? 'bg-bg-app text-zinc-400 border-border-main grayscale opacity-60 cursor-not-allowed' 
                            : user.isPublicProfileVisible 
                                ? 'bg-primary-main/10 text-primary-main border-primary-main/30' 
                                : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-bg-dark'
                    }`}
                >
                    {!isPro && <Lock size={12} className="text-primary-main/60" />}
                    {user.isPublicProfileVisible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Privado</>}
                </button>
            </div>

            {/* Brand fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-4 md:p-6 lg:p-8 bg-bg-app rounded-[24px] lg:rounded-[48px] border border-border-main">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">Nombre de la Academia</label>
                    <input type="text" disabled={!isPro} className={`w-full p-5 bg-surface text-text-main rounded-[24px] border border-transparent font-bold text-text-main shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none transition-all ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`} value={user.bizName || ''} onChange={e => setUser({ ...user, bizName: e.target.value })} placeholder="Ej: Academia Pro" />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">Categoría / Especialidad</label>
                    <input type="text" disabled={!isPro} className={`w-full p-5 bg-surface text-text-main rounded-[24px] border border-transparent font-bold text-text-main shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none transition-all ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`} value={user.businessCategory || ''} onChange={e => setUser({ ...user, businessCategory: e.target.value })} placeholder="Ej: Fitness, Música..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">Biografía / Descripción (Mín. 100 caracteres para landing)</label>
                    <textarea disabled={!isPro} className={`w-full p-5 bg-surface text-text-main rounded-[24px] border border-transparent font-bold text-text-main shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none min-h-[120px] transition-all ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`} value={user.biography || ''} onChange={e => setUser({ ...user, biography: e.target.value })} placeholder="Contanos sobre tu academia..." />
                </div>
                <div className="space-y-6 md:col-span-2 p-1.5 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-border-emerald/30 dark:to-emerald-500/10 rounded-[40px] shadow-sm">
                    <div className="bg-surface rounded-[34px] p-4 md:p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row gap-10 items-center">
                            <div 
                                className={`relative group shrink-0 ${isPro ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                onClick={() => isPro && fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary-main to-emerald-400 rounded-[32px] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-[30px] bg-zinc-100 dark:bg-bg-dark flex items-center justify-center overflow-hidden border-2 border-white dark:border-white/5 shadow-xl transition-transform group-hover:scale-[1.02]">
                                    {user.photoUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={user.photoUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isPro) return;
                                                    setUser({ ...user, photoUrl: '' });
                                                    showToast.success('Foto eliminada. No olvides guardar.');
                                                }}
                                                className={`absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 ${isPro ? 'group-hover:opacity-100 transition-all hover:bg-red-600 active:scale-95' : 'hidden'} z-40`}
                                                title="Eliminar Foto"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <UserIcon size={48} className="text-zinc-300 dark:text-text-main group-hover:opacity-20 transition-opacity" />
                                    )}
                                    
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-all">
                                        {isUploadingImage ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-white mb-2" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest text-center px-2">Subir Foto</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-6 w-full">
                                <div>
                                    <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-widest mb-1">Foto de Perfil / Logo</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Hacé clic en la imagen para subir desde tu dispositivo, o pegá una URL.</p>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        disabled={!isPro}
                                        className={`w-full p-5 pr-14 bg-bg-app text-text-main rounded-2xl border border-border-main font-bold text-text-main shadow-sm focus:ring-4 focus:ring-primary-main/5 outline-none transition-all ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`} 
                                        value={user.photoUrl || ''} 
                                        onChange={e => setUser({ ...user, photoUrl: e.target.value })} 
                                        placeholder={isPro ? "https://tusitio.com/logo.jpg o click en la foto" : "Función exclusiva para usuarios PRO"} 
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300">
                                        <ExternalLink size={20} />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-bg-app rounded-2xl border border-border-main">
                                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nombre Público</p>
                                        <p className="text-xs font-bold text-zinc-800 dark:text-emerald-50 truncate">{user.bizName || user.name || 'Sin nombre'}</p>
                                    </div>
                                    <div className="p-4 bg-bg-app rounded-2xl border border-border-main">
                                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Categoría</p>
                                        <p className="text-xs font-bold text-zinc-800 dark:text-emerald-50 truncate">{user.businessCategory || 'Profesional'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest flex items-center gap-2"><Instagram size={12} /> Instagram (Opcional)</label>
                    <input type="text" disabled={!isPro} className={`w-full p-5 bg-surface text-text-main rounded-[24px] border border-transparent font-bold text-text-main shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none transition-all ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`} value={user.instagramUrl || ''} onChange={e => setUser({ ...user, instagramUrl: e.target.value })} placeholder="@tu.usuario" />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest flex items-center gap-2"><Facebook size={12} /> Facebook (Opcional)</label>
                    <input type="text" disabled={!isPro} className={`w-full p-5 bg-surface text-text-main rounded-[24px] border border-transparent font-bold text-text-main shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none transition-all ${!isPro ? 'opacity-60 cursor-not-allowed' : ''}`} value={user.facebookUrl || ''} onChange={e => setUser({ ...user, facebookUrl: e.target.value })} placeholder="facebook.com/tu.pagina" />
                </div>
            </div>

            <div className="p-5 md:p-8 bg-primary-main/5 dark:bg-emerald-500/5 rounded-[32px] md:rounded-[40px] border border-primary-main/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary-main text-white flex items-center justify-center shadow-lg shadow-primary-glow"><ExternalLink size={24} /></div>
                    <div>
                        <p className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Tu Perfil Público</p>
                        <p className="text-xs font-bold text-primary-main/60 tracking-tight">{window.location.origin}/profile/{user.bizAlias || user.id}</p>
                    </div>
                </div>
                <button 
                    onClick={() => { 
                        if (!isPro) {
                            showToast.error('¡Actualizá tu plan a PRO para compartir tu perfil!');
                            return;
                        }
                        const profileId = user.bizAlias || user.id;
                        if (profileId) {
                            navigator.clipboard.writeText(`${window.location.origin}/profile/${profileId}`); 
                            showToast.success('¡Enlace copiado!'); 
                        } else {
                            showToast.error('Error al generar link. Por favor guarda los cambios primero.');
                        }
                    }}
                    className={`px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl border transition shadow-sm flex items-center gap-2 ${
                        isPro 
                            ? 'bg-surface text-zinc-900 dark:text-emerald-50 border-border-main hover:bg-zinc-50' 
                            : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-bg-dark cursor-not-allowed opacity-80'
                    }`}
                >
                    {!isPro && <Lock size={14} className="text-primary-main/60" />}
                    Copiar Link
                </button>
            </div>

            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </div>
    );
};

export default AcademyTab;
