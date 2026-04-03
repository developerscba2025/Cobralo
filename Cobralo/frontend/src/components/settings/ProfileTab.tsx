import React from 'react';
import { Save, RefreshCw, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { User } from '../../services/api';

interface ProfileTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    handleSave: () => void;
    saving: boolean;
    tab: { label: string; description?: string };
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, setUser, handleSave, saving, tab }) => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 text-primary-main/40 dark:text-emerald-500/30 mb-2">
                    <UserIcon size={24} />
                    <h2 className="text-base font-black uppercase tracking-[0.2em] underline decoration-primary-main/20 underline-offset-8">{tab.label}</h2>
                </div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em]">{tab.description || 'Información básica de tu cuenta.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 xl:gap-12 p-6 lg:p-12 bg-zinc-50 dark:bg-bg-dark rounded-[24px] lg:rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-inner">
                <div className="space-y-2">
                    <label className="block text-[11px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-3 ml-4 tracking-widest">Nombre Completo</label>
                    <input
                        type="text"
                        className="w-full p-4 lg:p-5 bg-white dark:bg-bg-soft dark:text-white rounded-2xl lg:rounded-[24px] border-none font-bold text-zinc-700 placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none"
                        value={user.name || ''}
                        onChange={e => setUser({ ...user, name: e.target.value })}
                        placeholder="Tu nombre completo"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[11px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-3 ml-4 tracking-widest">Email de Acceso</label>
                    <input
                        type="email"
                        className="w-full p-4 lg:p-5 bg-white dark:bg-bg-soft dark:text-white rounded-2xl lg:rounded-[24px] border-none font-bold text-zinc-700 placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none"
                        value={user.email || ''}
                        onChange={e => setUser({ ...user, email: e.target.value })}
                        placeholder="tu@email.com"
                    />
                </div>
                <div className="md:col-span-2 space-y-4 pt-4">
                    <label className="block text-[10px] font-black text-text-muted uppercase ml-4 tracking-[0.2em]">Preferencias Visuales</label>
                    <div className="flex p-1.5 bg-bg-app rounded-[28px] border border-border-emerald max-w-sm">
                        {(['light', 'dark'] as const).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTheme(t)}
                                className={`flex-1 py-3.5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                    theme === t
                                        ? 'bg-primary-main text-white shadow-lg shadow-primary-glow'
                                        : 'text-text-muted hover:text-text-main'
                                }`}
                            >
                                {t === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:py-5 lg:px-14 rounded-2xl lg:rounded-[28px] shadow-xl shadow-primary-glow hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Perfil</>}
                </button>
            </div>
        </div>
    );
};

export default ProfileTab;
