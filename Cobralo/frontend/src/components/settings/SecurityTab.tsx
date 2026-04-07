import React, { useState } from 'react';
import { Shield, Eye, EyeOff, RefreshCw } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';
import { api } from '../../services/api';
import { showToast } from '../Toast';
import { useNavigate } from 'react-router-dom';

interface SecurityTabProps {
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

const SecurityTab: React.FC<SecurityTabProps> = ({
    passwordData,
    setPasswordData,
    handleChangePassword,
    changingPassword,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
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
            navigate('/login');
        } catch (err: any) {
            showToast.error(err.message || 'Error al eliminar la cuenta');
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                    <Shield size={24} className="text-primary-main" /> Seguridad
                </h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Protegé tu cuenta y privacidad.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 lg:space-y-8 p-4 lg:p-10 bg-bg-app rounded-[24px] lg:rounded-[48px] border border-border-main">
                <h3 className="text-[10px] font-black text-zinc-400 dark:text-emerald-400/80 uppercase mb-8 ml-4 tracking-widest">Cambio de Contraseña</h3>
                <div className="space-y-6">
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="w-full p-5 bg-surface text-text-main rounded-[24px] border-none font-bold text-text-main shadow-sm pr-14"
                            placeholder="Contraseña Actual"
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-main transition-colors"
                        >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                className="w-full p-5 bg-surface text-text-main rounded-[24px] border-none font-bold text-text-main shadow-sm pr-14"
                                placeholder="Nueva Contraseña"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-main transition-colors"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="w-full p-5 bg-surface text-text-main rounded-[24px] border-none font-bold text-text-main shadow-sm pr-14"
                                placeholder="Repetir Nueva Contraseña"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary-main transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full lg:w-auto bg-primary-main text-white font-black py-4 px-8 lg:px-12 rounded-2xl lg:rounded-[24px] shadow-lg shadow-primary-glow flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {changingPassword ? <RefreshCw className="animate-spin" /> : 'Actualizar Contraseña'}
                    </button>
                </div>
            </form>

            <div className="p-4 lg:p-10 bg-red-500/5 rounded-[24px] lg:rounded-[48px] border border-red-500/10">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Zona Crítica</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mb-6">Si eliminas tu cuenta, perderás todos tus datos permanentemente.</p>
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
                confirmText={deleting ? "Eliminando..." : "Sí, eliminar cuenta"}
                cancelText="Cancelar"
                onConfirm={handleDeleteAccount}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};

export default SecurityTab;
