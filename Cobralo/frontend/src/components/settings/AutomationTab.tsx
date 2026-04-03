import React from 'react';
import { MessageSquare, Zap, Save, RefreshCw } from 'lucide-react';
import type { User } from '../../services/api';

interface AutomationTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    handleSave: () => void;
    saving: boolean;
}

const AutomationTab: React.FC<AutomationTabProps> = ({ user, setUser, handleSave, saving }) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                <MessageSquare size={24} className="text-primary-main" /> Automatización y Pagos
            </h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Simplificá tu gestión y cobros.</p>
        </div>

        <div className="p-5 lg:p-10 bg-zinc-50 dark:bg-bg-dark rounded-[32px] md:rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-inner space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Recordatorios Automáticos</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Notificaciones vía Email y WhatsApp</p>
                </div>
                <button
                    type="button"
                    onClick={() => setUser({ ...user, notificationsEnabled: !user.notificationsEnabled })}
                    className={`w-14 h-8 rounded-full relative transition-all duration-300 p-1 ${user.notificationsEnabled ? 'bg-primary-main' : 'bg-zinc-300 dark:bg-zinc-800'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="h-px bg-zinc-200/50 dark:bg-emerald-500/10" />

            <div>
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-4 ml-4 tracking-widest">Plantilla de WhatsApp Pro</label>
                <textarea
                    className="w-full p-4 lg:p-8 bg-white dark:bg-bg-soft dark:text-white rounded-[20px] lg:rounded-[32px] border-none focus:ring-2 focus:ring-primary-main/20 outline-none font-bold text-zinc-700 shadow-sm min-h-[140px] leading-relaxed"
                    value={user.reminderTemplate || ''}
                    onChange={e => setUser({ ...user, reminderTemplate: e.target.value })}
                    placeholder="Tu mensaje..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    {['{alumno}', '{monto}', '{negocio}', '{servicio}', '{link}', '{vencimiento}', '{mes}', '{moneda}', '{alias}'].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setUser({ ...user, reminderTemplate: (user.reminderTemplate || '') + ' ' + tag })}
                            className="px-4 py-2 bg-white dark:bg-bg-soft border border-zinc-100 dark:border-border-emerald rounded-xl text-[10px] font-black text-zinc-400 hover:text-primary-main hover:border-primary-main/30 transition-all uppercase tracking-widest"
                        >
                            +{tag.replace(/[{}]/g, '')}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="p-4 lg:p-10 bg-blue-50/30 dark:bg-blue-500/5 rounded-[24px] lg:rounded-[48px] border border-blue-100/50 dark:border-blue-500/10 space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-blue-700 dark:text-blue-400 flex items-center gap-2 uppercase tracking-tight">
                    <Zap size={20} /> Mercado Pago Automático
                </h3>
                <a href="https://www.mercadopago.com.ar/developers/panel/applications" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-blue-600 hover:underline">MP Developers ↗</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-blue-500/40 uppercase ml-4">Access Token</label>
                    <input type="password" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm" value={user.mpAccessToken || ''} onChange={e => setUser({ ...user, mpAccessToken: e.target.value })} placeholder="APP_USR-..." />
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-blue-500/40 uppercase ml-4">Public Key</label>
                    <input type="text" className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm" value={user.mpPublicKey || ''} onChange={e => setUser({ ...user, mpPublicKey: e.target.value })} placeholder="APP_USR-..." />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <button onClick={() => handleSave()} disabled={saving} className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:py-5 lg:px-14 rounded-2xl lg:rounded-[28px] shadow-xl shadow-primary-glow flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Todo</>}
            </button>
        </div>
    </div>
);

export default AutomationTab;
