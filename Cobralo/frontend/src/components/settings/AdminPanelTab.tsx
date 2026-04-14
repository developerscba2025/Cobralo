import React, { useState } from 'react';
import { Zap, Search, AlertCircle } from 'lucide-react';
import { showToast } from '../Toast';
import { api } from '../../services/api';

const AdminPanelTab: React.FC = () => {
    const [targetEmail, setTargetEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMakePro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetEmail) return;

        try {
            setLoading(true);
            const res = await api.makeAnyUserPro(targetEmail);
            showToast.success(res.message || 'Usuario actualizado a PRO exitosamente');
            setTargetEmail('');
        } catch (error: any) {
            showToast.error(error.message || 'Error al actualizar usuario a PRO');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                        <Zap size={24} className="fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text-main uppercase tracking-tighter">Modo Dios</h3>
                        <p className="text-sm font-bold text-text-muted">Administración global del sistema</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-surface border border-border-main rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm">
                <div>
                    <h4 className="text-lg font-black text-text-main mb-2">Otorgar Acceso PRO</h4>
                    <p className="text-sm text-text-muted mb-6">Ingresa el email de un usuario registrado para darle acceso PRO vitalicio sin costo.</p>

                    <form onSubmit={handleMakePro} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">
                                Email del Usuario destino
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search size={18} className="text-zinc-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="usuario@ejemplo.com"
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !targetEmail}
                            className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Zap size={16} className="fill-current" />
                                    Convertir a PRO
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs font-bold text-red-500/80">Esta acción modifica la base de datos de producción inmediatamente. El usuario recibirá 10 años de suscripción PRO. Usa esta función con responsabilidad.</p>
            </div>
        </div>
    );
};

export default AdminPanelTab;
