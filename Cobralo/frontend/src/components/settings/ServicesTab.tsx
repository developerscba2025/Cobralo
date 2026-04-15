import React, { useState } from 'react';
import { Zap, Star, Save, Trash2, RefreshCw, Edit2, X, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import type { User } from '../../services/api';

interface ServicesTabProps {
    user: Partial<User>;
    userServices: any[];
    newService: { name: string; defaultPrice: string };
    setNewService: (s: any) => void;
    handleAddService: () => void;
    handleUpdateService: (id: number, data: any) => Promise<void>;
    handleDeleteService: (id: number) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
    user, userServices, newService, setNewService,
    handleAddService, handleUpdateService, handleDeleteService,
}) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [updateStudents, setUpdateStudents] = useState(false);
    const [internalSaving, setInternalSaving] = useState(false);

    const startEditing = (service: any) => {
        setEditingId(service.id);
        setEditName(service.name);
        setEditPrice(service.defaultPrice.toString());
        setUpdateStudents(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setUpdateStudents(false);
    };

    const confirmUpdate = async (id: number) => {
        setInternalSaving(true);
        try {
            await handleUpdateService(id, {
                name: editName,
                defaultPrice: parseFloat(editPrice) || 0,
                updateStudents
            });
            setEditingId(null);
        } finally {
            setInternalSaving(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all">
            <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                    <Zap size={24} className="text-primary-main" /> Servicios
                </h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Configurá las clases y aranceles que ofrecés.</p>
            </div>

            {/* Add service form */}
            <div className="p-1 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-border-emerald/30 dark:to-emerald-500/10 rounded-[24px] lg:rounded-[3.5rem] shadow-sm">
                <div className="bg-surface rounded-[22px] lg:rounded-[3.4rem] p-4 lg:p-10 space-y-8 transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 items-start w-full">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-end">
                                <div className="md:col-span-6 lg:col-span-7 space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                                        <Star size={12} className="text-primary-main" /> Nombre del Servicio
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Clases de Inglés" 
                                        className="w-full h-16 bg-bg-app px-6 rounded-2xl text-sm font-bold border border-border-main/50 focus:border-primary-main/50 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-text-main" 
                                        value={newService.name} 
                                        onChange={e => setNewService({ ...newService, name: e.target.value })} 
                                    />
                                </div>
                                <div className="md:col-span-3 lg:col-span-3 space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                                        <Star size={12} className="text-primary-main" /> Precio Base
                                    </label>
                                    <div className="relative h-16">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-main font-black text-lg">
                                            {user.currency || '$'}
                                        </div>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            className="w-full h-full bg-bg-app pl-10 pr-6 rounded-2xl text-lg font-black border border-border-main/50 focus:border-primary-main/50 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-text-main font-mono" 
                                            value={newService.defaultPrice} 
                                            onChange={e => setNewService({ ...newService, defaultPrice: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3 lg:col-span-2">
                                    <button 
                                        onClick={handleAddService} 
                                        className="w-full h-16 bg-primary-main text-white px-8 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-primary-glow flex items-center justify-center gap-2.5 active:scale-95 group whitespace-nowrap"
                                    >
                                        <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.1em]">Agregar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                        {userServices.length === 0 ? (
                            <div className="md:col-span-2 py-10 border-2 border-dashed border-border-main/20 rounded-[32px] text-center">
                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">No tenés servicios cargados</p>
                            </div>
                        ) : (
                            userServices.map(service => {
                                const isEditing = editingId === service.id;
                                const priceDiff = isEditing ? (parseFloat(editPrice) || 0) - service.defaultPrice : 0;
                                const percentDiff = service.defaultPrice > 0 ? (priceDiff / service.defaultPrice) * 100 : 0;

                                return (
                                    <div key={service.id} className={`p-6 rounded-[32px] border transition-all duration-300 ${isEditing ? 'bg-surface border-primary-main shadow-lg ring-4 ring-primary-main/5 scale-[1.02]' : 'bg-zinc-50/50 dark:bg-bg-dark/40 border-border-main/10 hover:border-primary-main/20 hover:bg-zinc-50 dark:hover:bg-bg-dark'}`}>
                                        {isEditing ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Editar Nombre</label>
                                                        <input 
                                                            autoFocus
                                                            className="w-full bg-bg-app border border-border-main/50 p-3 rounded-xl text-xs font-bold outline-none focus:border-primary-main/30"
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="w-1/3 space-y-2">
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nuevo Precio</label>
                                                        <input 
                                                            type="number"
                                                            className="w-full bg-bg-app border border-border-main/50 p-3 rounded-xl text-xs font-black outline-none focus:border-primary-main/30 font-mono"
                                                            value={editPrice}
                                                            onChange={e => setEditPrice(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Price change indicator */}
                                                {priceDiff !== 0 && (
                                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider p-2 px-3 rounded-lg w-fit ${priceDiff > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                        {priceDiff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                        {priceDiff > 0 ? 'Aumento' : 'Descuento'} del {Math.abs(percentDiff).toFixed(1)}% ({user.currency}{Math.abs(priceDiff)})
                                                    </div>
                                                )}

                                                {/* Propagation Toggle */}
                                                <div className="flex items-center gap-3 p-4 bg-primary-main/5 rounded-2xl border border-primary-main/10 cursor-pointer hover:bg-primary-main/10 transition-colors" onClick={() => setUpdateStudents(!updateStudents)}>
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${updateStudents ? 'bg-primary-main border-primary-main text-white' : 'border-primary-main/30'}`}>
                                                        {updateStudents && <CheckCircle2 size={14} strokeWidth={3} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black text-zinc-700 dark:text-emerald-50 uppercase tracking-tight">Aplicar a alumnos actuales</p>
                                                        <p className="text-[9px] font-bold text-zinc-400 mt-0.5">Esto actualizará el arancel de todos los alumnos de {service.name}.</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => confirmUpdate(service.id)} 
                                                        disabled={internalSaving}
                                                        className="flex-1 bg-primary-main text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        {internalSaving ? <RefreshCw className="animate-spin" size={12} /> : <><Save size={14} /> Guardar</>}
                                                    </button>
                                                    <button 
                                                        onClick={cancelEditing}
                                                        className="px-4 py-3 bg-zinc-100 dark:bg-white/5 text-zinc-400 rounded-xl hover:bg-zinc-200 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 group">
                                                {/* Left Icon Area */}
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface flex items-center justify-center text-primary-main shadow-sm border border-border-main/30 group-hover:scale-105 transition-all duration-300 shrink-0">
                                                    <Star size={24} className="fill-primary-main/10" />
                                                </div>

                                                {/* Middle Content Area - Responsive Flex/Grid */}
                                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 gap-x-4">
                                                    <div className="min-w-0">
                                                        <p className="font-black text-zinc-800 dark:text-white text-base tracking-tight truncate leading-tight" title={service.name}>
                                                            {service.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] sm:text-[11px] font-black text-primary-main uppercase tracking-widest bg-primary-main/10 px-2.5 py-1 rounded-xl border border-primary-main/10 whitespace-nowrap">
                                                                {user.currency}{Number(service.defaultPrice).toLocaleString('es-AR')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right Actions Area */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button 
                                                            onClick={() => startEditing(service)} 
                                                            className="p-2 sm:p-2.5 text-zinc-400 hover:text-primary-main hover:bg-primary-main/5 dark:hover:bg-primary-main/10 rounded-xl transition-all active:scale-95" 
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteService(service.id)} 
                                                            className="p-2 sm:p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-95" 
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesTab;
