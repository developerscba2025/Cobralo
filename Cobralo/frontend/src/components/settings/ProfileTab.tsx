import React from 'react';
import { Save, RefreshCw, User as UserIcon } from 'lucide-react';
import type { User } from '../../services/api';

interface ProfileTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    handleSave: () => void;
    saving: boolean;
    tab: { label: string; description?: string };
}
const ProfileTab: React.FC<ProfileTabProps> = ({ user, setUser, handleSave, saving, tab }) => {

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                    <UserIcon size={24} className="text-primary-main" /> {tab.label}
                </h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{tab.description || 'Información básica de tu cuenta.'}</p>
            </div>

            <div className="flex flex-col gap-8 p-5 md:p-6 lg:p-8 xl:p-10 bg-bg-app rounded-[24px] lg:rounded-[40px] border border-border-main">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-8 xl:gap-10">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Nombre Completo</label>
                        <input
                            type="text"
                            className="w-full py-3.5 px-5 lg:py-4 lg:px-6 bg-surface text-text-main rounded-xl lg:rounded-[20px] border-none font-bold text-text-main placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm"
                            value={user.name || ''}
                            onChange={e => setUser({ ...user, name: e.target.value })}
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Email de Acceso</label>
                        <input
                            type="email"
                            className="w-full py-3.5 px-5 lg:py-4 lg:px-6 bg-surface text-text-main rounded-xl lg:rounded-[20px] border-none font-bold text-text-main placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm"
                            value={user.email || ''}
                            onChange={e => setUser({ ...user, email: e.target.value })}
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-8 xl:gap-10">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Número de Teléfono</label>
                        <input
                            type="tel"
                            className="w-full py-3.5 px-5 lg:py-4 lg:px-6 bg-surface text-text-main rounded-xl lg:rounded-[20px] border-none font-bold text-text-main placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm"
                            value={user.phoneNumber || ''}
                            onChange={e => setUser({ ...user, phoneNumber: e.target.value })}
                            placeholder="+54 9 11 1234-5678"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Moneda Principal</label>
                        <div className="relative">
                            <select
                                className="w-full py-3.5 px-5 lg:py-4 lg:px-6 bg-surface text-text-main rounded-xl lg:rounded-[20px] border-none font-bold text-text-main shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm appearance-none cursor-pointer"
                                value={user.currency || 'ARS'}
                                onChange={e => setUser({ ...user, currency: e.target.value })}
                            >
                                <option value="ARS">ARS ($)</option>
                                <option value="USD">USD ($)</option>
                                <option value="CLP">CLP ($)</option>
                                <option value="MXN">MXN ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-zinc-400">
                                <span className="text-xs">▼</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:py-5 lg:px-14 rounded-2xl lg:rounded-[28px] shadow-xl shadow-primary-glow hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Cambios</>}
                </button>
            </div>
        </div>
    );
};

export default ProfileTab;
