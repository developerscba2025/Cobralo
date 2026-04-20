import React, { useState } from 'react';
import { Zap, Star, Save, Trash2, RefreshCw, Edit2, X, CheckCircle2, TrendingUp, TrendingDown, LayoutGrid, Plus, DollarSign } from 'lucide-react';
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Gestión de Aranceles</p>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 tracking-tight uppercase">
                        <Zap size={32} className="text-emerald-500 fill-emerald-500/10" /> Servicios
                    </h2>
                </div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest max-w-sm md:text-right">
                    Definí los módulos de aprendizaje y sus honorarios base para automatizar tu facturación.
                </p>
            </div>

            {/* Main Content Grid: Add + List */}
            <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
                
                {/* Services List (The Bento Grid) */}
                <div className="order-2 lg:order-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userServices.length === 0 ? (
                            <div className="md:col-span-2 py-20 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4 group">
                                <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-2xl text-zinc-300 dark:text-zinc-700 transition-colors group-hover:text-emerald-500/50">
                                    <Star size={48} strokeWidth={1} />
                                </div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">No tenés servicios registrados aún</p>
                            </div>
                        ) : (
                            userServices.map(service => {
                                const isEditing = editingId === service.id;
                                const priceDiff = isEditing ? (parseFloat(editPrice) || 0) - service.defaultPrice : 0;
                                const percentDiff = service.defaultPrice > 0 ? (priceDiff / service.defaultPrice) * 100 : 0;

                                return (
                                    <div 
                                        key={service.id} 
                                        className={`group relative p-6 rounded-[32px] border transition-all duration-500 overflow-hidden ${
                                            isEditing 
                                            ? 'bg-zinc-50 dark:bg-black/40 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-[1.02] z-10' 
                                            : 'bg-zinc-50/50 dark:bg-white/5 border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 hover:bg-zinc-50 dark:hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/5'
                                        }`}
                                    >
                                        {isEditing ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Editando Protocolo</span>
                                                    <button onClick={cancelEditing} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-zinc-400 transition-colors">
                                                        <X size={16} />
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Identificador</label>
                                                        <input 
                                                            autoFocus
                                                            className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500/50 transition-all text-zinc-900 dark:text-emerald-50"
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                        />
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Arancel Base</label>
                                                        <div className="relative">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">{user.currency}</div>
                                                            <input 
                                                                type="number"
                                                                className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 p-4 pl-10 rounded-2xl text-lg font-black outline-none focus:border-emerald-500/50 transition-all font-mono text-zinc-900 dark:text-emerald-50"
                                                                value={editPrice}
                                                                onChange={e => setEditPrice(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {priceDiff !== 0 && (
                                                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider p-3 rounded-xl ${priceDiff > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                        {priceDiff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        {priceDiff > 0 ? 'Incremento' : 'Reducción'} del {Math.abs(percentDiff).toFixed(1)}%
                                                    </div>
                                                )}

                                                <div 
                                                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${updateStudents ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-zinc-200 dark:hover:border-white/10'}`} 
                                                    onClick={() => setUpdateStudents(!updateStudents)}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${updateStudents ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                                        {updateStudents && <CheckCircle2 size={14} strokeWidth={3} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black text-zinc-700 dark:text-emerald-50 uppercase tracking-tight">Propagar cambios</p>
                                                        <p className="text-[9px] font-bold text-zinc-400 mt-0.5 leading-relaxed">Actualizar el costo mensual a todos los alumnos vinculados a este servicio.</p>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => confirmUpdate(service.id)} 
                                                    disabled={internalSaving}
                                                    className="w-full bg-emerald-500 text-black py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                                >
                                                    {internalSaving ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={16} /> Guardar Cambios</>}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col h-full gap-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center text-emerald-500 shadow-sm border border-zinc-100 dark:border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                        <Star size={24} className="fill-emerald-500/10" />
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -mr-2">
                                                        <button 
                                                            onClick={() => startEditing(service)} 
                                                            className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteService(service.id)} 
                                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 flex-1">
                                                    <h4 className="font-black text-zinc-900 dark:text-white text-xl tracking-tight leading-none group-hover:text-emerald-500 transition-colors duration-500">
                                                        {service.name}
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl font-black text-emerald-500 font-mono tracking-tighter">
                                                            {user.currency}{Number(service.defaultPrice).toLocaleString('es-AR')}
                                                        </span>
                                                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Pago Base</span>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Activo</span>
                                                    </div>
                                                    <div className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Módulo ID: {service.id}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Add Service Section (Side Panel Bento) */}
                <div className="order-1 lg:order-2 space-y-6 lg:sticky lg:top-8">
                    <div className="bg-zinc-900 dark:bg-black p-8 rounded-[40px] shadow-2xl shadow-emerald-500/5 border border-white/5 space-y-8 relative overflow-hidden group">
                        {/* Decorative Gradient Overlay */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                        
                        <div className="space-y-1 relative z-10">
                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Nuevo Protocolo</h3>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Dar de alta actividad</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <LayoutGrid size={12} className="text-emerald-500" /> Identificador
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Nombre del servicio..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-700" 
                                    value={newService.name} 
                                    onChange={e => setNewService({ ...newService, name: e.target.value })} 
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <DollarSign size={12} className="text-emerald-500" /> Honorario Sugerido
                                </label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">
                                        {user.currency || '$'}
                                    </div>
                                    <input 
                                        type="number" 
                                        placeholder="0" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-12 text-2xl font-black text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all font-mono placeholder:text-zinc-700" 
                                        value={newService.defaultPrice} 
                                        onChange={e => setNewService({ ...newService, defaultPrice: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleAddService} 
                                className="w-full py-5 bg-emerald-500 text-black rounded-[24px] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                                Crear Módulo
                            </button>
                        </div>

                        <div className="pt-6 border-t border-white/5 text-center relative z-10">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                Los cambios en el honorario base no afectan retroactivamente a menos que se solicite explícitamente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesTab;

