import React, { useState } from 'react';
import { Zap, Search, AlertCircle, Calendar, ShieldCheck, UserMinus, Rocket } from 'lucide-react';
import { showToast } from '../Toast';
import { api } from '../../services/api';

const AdminPanelTab: React.FC = () => {
    const [targetEmail, setTargetEmail] = useState('');
    const [plan, setPlan] = useState('PRO');
    const [expiryDate, setExpiryDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetEmail) return;

        try {
            setLoading(true);
            const res = await api.updateUserPlanAdmin(targetEmail, plan, expiryDate || undefined);
            showToast.success(res.message || 'Usuario actualizado exitosamente');
            setTargetEmail('');
            setExpiryDate('');
        } catch (error: any) {
            showToast.error(error.message || 'Error al actualizar usuario');
        } finally {
            setLoading(false);
        }
    };

    const planOptions = [
        { id: 'PRO', label: 'Plan PRO', icon: Rocket, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { id: 'INITIAL', label: 'Plan BASIC', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { id: 'FREE', label: 'Plan FREE', icon: UserMinus, color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Zap size={24} className="fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">Modo Dios</h3>
                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Panel de Control Maestro</p>
                    </div>
                </div>
            </div>

            {/* Main Form */}
            <div className="bg-surface border border-border-main rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 lg:p-8 border-b border-border-main bg-zinc-50/50 dark:bg-zinc-800/10">
                    <h4 className="text-lg font-black text-text-main mb-1">Gestión de Suscripciones</h4>
                    <p className="text-sm text-text-muted">Busca un usuario y define su plan y acceso de forma manual.</p>
                </div>

                <form onSubmit={handleUpdatePlan} className="p-6 lg:p-8 space-y-8">
                    {/* User Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 block">
                            Email del Usuario
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-purple-500 transition-colors">
                                <Search size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-bg-dark dark:text-white rounded-2xl border-2 border-transparent outline-none font-bold text-sm transition-all focus:border-purple-500/30 focus:bg-white dark:focus:bg-zinc-900 shadow-inner"
                                placeholder="ejemplo@correo.com"
                                value={targetEmail}
                                onChange={(e) => setTargetEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 block">
                            Seleccionar Plan
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {planOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setPlan(opt.id)}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                                        plan === opt.id 
                                        ? `${opt.border} ${opt.bg} scale-[1.02] shadow-md` 
                                        : 'border-transparent bg-zinc-100 dark:bg-bg-dark grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                    }`}
                                >
                                    <opt.icon size={24} className={opt.color} />
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${plan === opt.id ? opt.color : 'text-text-muted'}`}>
                                        {opt.label}
                                    </span>
                                    {plan === opt.id && (
                                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${opt.color.replace('text', 'bg')}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 block">
                            Fecha de Expiración (Opcional)
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-purple-500 transition-colors">
                                <Calendar size={20} />
                            </div>
                            <input
                                type="date"
                                className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-bg-dark dark:text-white rounded-2xl border-2 border-transparent outline-none font-bold text-sm transition-all focus:border-purple-500/30 focus:bg-white dark:focus:bg-zinc-900 shadow-inner"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
                        <p className="text-[9px] text-text-muted italic ml-2">Si se deja vacío, se asignará un tiempo por defecto (PRO: 10 años, BASIC: 30 días, FREE: Ilimitado).</p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !targetEmail}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <Zap size={18} className="fill-current" />
                                Actualizar Suscripción
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-4">
                <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                    <p className="text-xs font-black text-yellow-600 dark:text-yellow-500 uppercase">Aviso de Seguridad</p>
                    <p className="text-[11px] font-bold text-yellow-700/80 dark:text-yellow-500/70 leading-relaxed">
                        Esta acción impacta directamente en la base de datos de producción. El cambio de plan es instantáneo y afectará la experiencia del usuario de inmediato.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPanelTab;
