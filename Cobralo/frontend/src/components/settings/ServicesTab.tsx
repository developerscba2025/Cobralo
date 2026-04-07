import React from 'react';
import { Zap, Star, Save, Trash2, RefreshCw } from 'lucide-react';
import type { User } from '../../services/api';

interface ServicesTabProps {
    user: Partial<User>;
    userServices: any[];
    newService: { name: string; defaultPrice: string };
    setNewService: (s: any) => void;
    handleAddService: () => void;
    handleDeleteService: (id: number) => void;
    handleSave: () => void;
    saving: boolean;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
    user, userServices, newService, setNewService,
    handleAddService, handleDeleteService, handleSave, saving,
}) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
        <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                <Zap size={24} className="text-primary-main" /> Servicios
            </h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Configurá las clases y aranceles que ofrecés.</p>
        </div>

        {/* Add service form */}
        <div className="p-1 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-border-emerald/30 dark:to-emerald-500/10 rounded-[24px] lg:rounded-[3.5rem] shadow-sm">
            <div className="bg-surface rounded-[22px] lg:rounded-[3.4rem] p-4 lg:p-10 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 items-start">
                    <div className="space-y-4">
                        <div className="w-14 h-14 rounded-3xl bg-primary-main/10 flex items-center justify-center text-primary-main rotate-3"><Zap size={28} /></div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tighter">Servicios Ofrecidos</h3>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Configurá tus clases y aranceles</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto flex-1 max-w-2xl">
                        <div className="flex-1 w-full min-w-[140px]">
                            <label className="block lg:hidden text-[10px] font-black text-zinc-400 uppercase mb-2 ml-2 tracking-widest">Nombre del Servicio</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Clase de Yoga" 
                                className="w-full h-14 bg-bg-app px-6 rounded-2xl text-sm font-bold border border-transparent focus:border-primary-main/30 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-text-main" 
                                value={newService.name} 
                                onChange={e => setNewService({ ...newService, name: e.target.value })} 
                            />
                        </div>
                        <div className="w-full sm:w-32 shrink-0">
                            <label className="block lg:hidden text-[10px] font-black text-zinc-400 uppercase mb-2 ml-2 tracking-widest">Precio</label>
                            <div className="relative h-14">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                                    {user.currency || '$'}
                                </div>
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full h-full bg-bg-app pl-8 pr-6 rounded-2xl text-sm font-bold border border-transparent focus:border-primary-main/30 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-text-main font-mono" 
                                    value={newService.defaultPrice} 
                                    onChange={e => setNewService({ ...newService, defaultPrice: e.target.value })} 
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleAddService} 
                            className="w-full sm:w-auto h-14 bg-primary-main text-white px-8 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-primary-glow flex items-center justify-center gap-2.5 active:scale-95 group whitespace-nowrap shrink-0"
                        >
                            <Zap size={16} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-[0.1em]">Agregar</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userServices.length === 0 ? (
                        <div className="md:col-span-2 py-10 border-2 border-dashed border-border-main/20 rounded-[32px] text-center">
                            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">No tenés servicios cargados</p>
                        </div>
                    ) : (
                        userServices.map(service => (
                            <div key={service.id} className="flex items-center justify-between p-5 bg-zinc-50/50 dark:bg-bg-dark/40 rounded-[28px] border border-border-main/10 group hover:border-primary-main/20 hover:bg-zinc-50 dark:hover:bg-bg-dark transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary-main shadow-sm border border-border-main/30 group-hover:scale-110 transition-transform">
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

        <div className="flex justify-end pt-4">
            <button onClick={() => handleSave()} disabled={saving} className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:py-5 lg:px-14 rounded-2xl lg:rounded-[28px] shadow-xl shadow-primary-glow flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Cambios</>}
            </button>
        </div>
    </div>
);

export default ServicesTab;
