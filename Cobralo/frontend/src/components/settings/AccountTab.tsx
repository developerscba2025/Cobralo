import React, { useState } from 'react';
import { User as UserIcon, Shield, RefreshCw, Eye, EyeOff } from 'lucide-react';
import type { User } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import { api } from '../../services/api';
import { showToast } from '../Toast';
import { useNavigate } from 'react-router-dom';

interface AccountTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    passwordData: { currentPassword: string; newPassword: string; confirmPassword: string };
    setPasswordData: (d: any) => void;
    handleChangePassword: (e: React.FormEvent) => void;
    changingPassword: boolean;
    showCurrentPassword: boolean;
    setShowCurrentPassword: (v: boolean) => void;
    showNewPassword: boolean;
    setShowNewPassword: (v: boolean) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (v: boolean) => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
    user, setUser,
    passwordData, setPasswordData, handleChangePassword, changingPassword,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    showConfirmPassword, setShowConfirmPassword,
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        try {
            setDeleting(true);
            await api.deleteAccount();
            localStorage.removeItem('token');
            showToast.success('Cuenta eliminada permanentemente');
            navigate('/app/login');
        } catch (err: any) {
            showToast.error(err.message || 'Error al eliminar la cuenta');
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* ── DATOS PERSONALES ── */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-primary-main/10 flex items-center justify-center">
                        <UserIcon size={18} className="text-primary-main" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-emerald-50 tracking-tight uppercase">Mis Datos</h2>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Información básica de tu cuenta</p>
                    </div>
                </div>

                <div className="flex flex-col gap-5 p-5 md:p-6 lg:p-8 bg-bg-app rounded-[24px] lg:rounded-[32px] border border-border-main">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Nombre Completo</label>
                            <input
                                type="text"
                                className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm"
                                value={user.name || ''}
                                onChange={e => setUser({ ...user, name: e.target.value })}
                                placeholder="Tu nombre completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Email de Acceso</label>
                            <input
                                type="email"
                                className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm"
                                value={user.email || ''}
                                onChange={e => setUser({ ...user, email: e.target.value })}
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Número de Teléfono</label>
                            <input
                                type="tel"
                                className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm"
                                value={user.phoneNumber || ''}
                                onChange={e => setUser({ ...user, phoneNumber: e.target.value })}
                                placeholder="+54 9 11 1234-5678"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-400/70 uppercase mb-2 ml-4 tracking-widest">Moneda Principal</label>
                            <div className="relative">
                                <select
                                    className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none text-sm appearance-none cursor-pointer"
                                    value={user.currency || 'ARS'}
                                    onChange={e => setUser({ ...user, currency: e.target.value })}
                                >
                                    <option value="ARS">ARS ($)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="CLP">CLP ($)</option>
                                    <option value="MXN">MXN ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-zinc-400">
                                    <span className="text-xs">▼</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SEGURIDAD ── */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-primary-main/10 flex items-center justify-center">
                        <Shield size={18} className="text-primary-main" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-zinc-900 dark:text-emerald-50 tracking-tight uppercase">Seguridad</h2>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Protegé tu acceso</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="p-5 md:p-6 lg:p-8 bg-bg-app rounded-[24px] lg:rounded-[32px] border border-border-main space-y-5">
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold shadow-sm pr-14 outline-none focus:ring-2 focus:ring-primary-main/20 text-sm"
                            placeholder="Contraseña Actual"
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                        />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-main transition-colors">
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold shadow-sm pr-14 outline-none focus:ring-2 focus:ring-primary-main/20 text-sm"
                                placeholder="Nueva Contraseña"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-main transition-colors">
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="w-full py-3.5 px-5 bg-surface text-text-main rounded-xl border-none font-bold shadow-sm pr-14 outline-none focus:ring-2 focus:ring-primary-main/20 text-sm"
                                placeholder="Repetir Nueva Contraseña"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-main transition-colors">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:px-12 rounded-2xl shadow-lg shadow-primary-glow flex items-center justify-center gap-2 uppercase tracking-widest text-xs active:scale-95 transition-all"
                        >
                            {changingPassword ? <RefreshCw className="animate-spin" size={18} /> : 'Actualizar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── ZONA CRÍTICA ── */}
            <div className="p-4 lg:p-8 bg-red-500/5 rounded-[24px] border border-red-500/10">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-3">Zona Crítica</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mb-5">Si eliminás tu cuenta, perderás todos tus datos permanentemente.</p>
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-8 py-4 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                    Eliminar Mi Cuenta
                </button>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="¿Eliminar tu cuenta?"
                message="Esta acción es irreversible y borrará todos tus alumnos, pagos y configuraciones permanentemente."
                confirmText={deleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
                cancelText="Cancelar"
                onConfirm={handleDeleteAccount}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};

export default AccountTab;
