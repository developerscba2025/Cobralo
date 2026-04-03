import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Zap, Star, ExternalLink, Eye, EyeOff, RefreshCw, Save, Trash2, User as UserIcon, Check, CreditCard, Instagram, Facebook } from 'lucide-react';
import { ProFeature } from '../ProGuard';
import { showToast } from '../Toast';
import type { User } from '../../services/api';

interface AcademyTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    handleSave: () => void;
    saving: boolean;
    userServices: any[];
    newService: { name: string; defaultPrice: string };
    setNewService: (s: any) => void;
    handleAddService: () => void;
    handleDeleteService: (id: number) => void;
    isPro: boolean;
    pendingAdjustment: any;
    setLegalModal: (m: any) => void;
    studentCount: number;
    scheduleCount: number;
    hasRecentPayments: boolean;
}

const AcademyTab: React.FC<AcademyTabProps> = ({
    user, setUser, handleSave, saving,
    userServices, newService, setNewService, handleAddService, handleDeleteService,
    isPro, pendingAdjustment, setLegalModal,
    studentCount, scheduleCount, hasRecentPayments,
}) => (
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
                <button onClick={() => setLegalModal({ isOpen: true, type: 'terms' })} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20">Ver Términos</button>
            </div>
        )}

        {/* Visibility card */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-main/20 via-amber-400/20 to-primary-main/20 rounded-[48px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative p-5 lg:p-10 bg-white dark:bg-bg-dark rounded-[32px] md:rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-xl overflow-hidden">
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
                            <div className="h-4 w-full bg-zinc-100 dark:bg-bg-soft rounded-full overflow-hidden p-1 shadow-inner border border-zinc-200/50 dark:border-white/5">
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
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.active ? 'bg-primary-main text-white' : 'bg-zinc-200 dark:bg-bg-soft text-zinc-400'}`}>
                                    {item.active ? <Check size={16} /> : <item.icon size={16} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${item.active ? 'text-zinc-800 dark:text-emerald-50' : 'text-zinc-400'}`}>{item.label}</p>
                                    {(item as any).target && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-1 flex-1 bg-zinc-200 dark:bg-bg-soft rounded-full overflow-hidden">
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
                    <Building2 size={24} className="text-primary-main" /> Mi Marca y Servicios
                </h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Gestioná tu academia y perfil público.</p>
            </div>
            <ProFeature featureName="Perfil Público" inline>
                <button
                    onClick={() => setUser({ ...user, isPublicProfileVisible: !user.isPublicProfileVisible })}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 border ${user.isPublicProfileVisible ? 'bg-primary-main/10 text-primary-main border-primary-main/30' : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-bg-dark'}`}
                >
                    {user.isPublicProfileVisible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Privado</>}
                </button>
            </ProFeature>
        </div>

        {/* Brand fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-10 bg-zinc-50 dark:bg-bg-dark rounded-[24px] lg:rounded-[48px] border border-zinc-100 dark:border-border-emerald">
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">Nombre de la Academia</label>
                <input type="text" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none" value={user.bizName || ''} onChange={e => setUser({ ...user, bizName: e.target.value })} placeholder="Ej: Academia Pro" />
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">Categoría / Especialidad</label>
                <input type="text" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none" value={user.businessCategory || ''} onChange={e => setUser({ ...user, businessCategory: e.target.value })} placeholder="Ej: Fitness, Música..." />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">Biografía / Descripción (Mín. 100 caracteres para landing)</label>
                <textarea className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none min-h-[120px]" value={user.biography || ''} onChange={e => setUser({ ...user, biography: e.target.value })} placeholder="Contanos sobre tu academia..." />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest">URL de Foto de Perfil</label>
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-bg-soft flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-white/5">
                        {user.photoUrl ? <img src={user.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-zinc-300" />}
                    </div>
                    <input type="text" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none" value={user.photoUrl || ''} onChange={e => setUser({ ...user, photoUrl: e.target.value })} placeholder="https://ejemplo.com/tu-foto.jpg" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest flex items-center gap-2"><Instagram size={12} /> Instagram (Opcional)</label>
                <input type="text" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none" value={user.instagramUrl || ''} onChange={e => setUser({ ...user, instagramUrl: e.target.value })} placeholder="@tu.usuario" />
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-2 ml-4 tracking-widest flex items-center gap-2"><Facebook size={12} /> Facebook (Opcional)</label>
                <input type="text" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none" value={user.facebookUrl || ''} onChange={e => setUser({ ...user, facebookUrl: e.target.value })} placeholder="facebook.com/tu.pagina" />
            </div>

            {/* Services */}
            <div className="md:col-span-2 p-1 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-border-emerald/30 dark:to-emerald-500/10 rounded-[24px] lg:rounded-[3.5rem] shadow-sm">
                <div className="bg-white dark:bg-bg-soft rounded-[22px] lg:rounded-[3.4rem] p-4 lg:p-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="w-14 h-14 rounded-3xl bg-primary-main/10 flex items-center justify-center text-primary-main shadow-inner rotate-3"><Zap size={28} /></div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tighter">Servicios Ofrecidos</h3>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Configurá tus clases y aranceles</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <input type="text" placeholder="Ej: Clase de Yoga" className="w-full sm:flex-1 md:w-64 bg-zinc-50 dark:bg-bg-dark p-4 px-6 rounded-2xl text-sm font-bold border border-transparent focus:border-primary-main/30 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-zinc-700 dark:text-white" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
                            <div className="relative w-full sm:w-32">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</div>
                                <input type="number" placeholder="0" className="w-full bg-zinc-50 dark:bg-bg-dark p-4 pl-8 pr-6 rounded-2xl text-sm font-bold border border-transparent focus:border-primary-main/30 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-zinc-700 dark:text-white" value={newService.defaultPrice} onChange={e => setNewService({ ...newService, defaultPrice: e.target.value })} />
                            </div>
                            <button onClick={handleAddService} className="w-full sm:w-auto bg-primary-main text-white p-4 px-8 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-primary-glow flex items-center justify-center gap-2 active:scale-95 group whitespace-nowrap">
                                <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Agregar</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userServices.length === 0 ? (
                            <div className="md:col-span-2 py-10 border-2 border-dashed border-zinc-100 dark:border-border-emerald/20 rounded-[32px] text-center">
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">No tenés servicios cargados</p>
                            </div>
                        ) : (
                            userServices.map(service => (
                                <div key={service.id} className="flex items-center justify-between p-5 bg-zinc-50/50 dark:bg-bg-dark/40 rounded-[28px] border border-zinc-100 dark:border-border-emerald/10 group hover:border-primary-main/20 hover:bg-zinc-50 dark:hover:bg-bg-dark transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-bg-soft flex items-center justify-center text-primary-main shadow-sm border border-zinc-100 dark:border-border-emerald/30 group-hover:scale-110 transition-transform">
                                            <Star size={20} className="fill-primary-main/10" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-800 dark:text-emerald-50 text-sm tracking-tight">{service.name}</p>
                                            <span className="text-[10px] font-black text-primary-main uppercase tracking-widest bg-primary-main/10 px-2 py-0.5 rounded-lg">
                                                {user.currency}{Number(service.defaultPrice).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteService(service.id)} className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all" title="Eliminar servicio">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        <ProFeature featureName="Perfil Público" inline>
            <div className="p-5 md:p-8 bg-primary-main/5 dark:bg-emerald-500/5 rounded-[32px] md:rounded-[40px] border border-primary-main/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary-main text-white flex items-center justify-center shadow-lg shadow-primary-glow"><ExternalLink size={24} /></div>
                    <div>
                        <p className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Tu Perfil Público</p>
                        <p className="text-xs font-bold text-primary-main/60 tracking-tight">{window.location.origin}/profile/{user.bizAlias || user.id}</p>
                    </div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/profile/${user.bizAlias || user.id}`); showToast.success('¡Enlace copiado!'); }}
                    className="px-8 py-4 bg-white dark:bg-bg-soft text-zinc-900 dark:text-emerald-50 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-zinc-100 dark:border-border-emerald hover:bg-zinc-50 transition shadow-sm">
                    Copiar Link
                </button>
            </div>
        </ProFeature>

        <div className="flex justify-end pt-4">
            <button onClick={() => handleSave()} disabled={saving} className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:py-5 lg:px-14 rounded-2xl lg:rounded-[28px] shadow-xl shadow-primary-glow flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Academia</>}
            </button>
        </div>
    </div>
);

export default AcademyTab;
