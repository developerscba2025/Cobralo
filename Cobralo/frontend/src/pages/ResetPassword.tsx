import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            showToast.error('El enlace de recuperación no es válido o está incompleto.');
            navigate('/app/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) return;

        if (password !== confirmPassword) {
            showToast.error('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            showToast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
            return;
        }

        setIsLoading(true);
        try {
            await api.resetPassword({ token, password });
            showToast.success('¡Contraseña actualizada con éxito! Logueate para continuar.');
            navigate('/app/login');
        } catch (error: any) {
            showToast.error(error.message || 'Error al restablecer la contraseña. Puede que el enlace haya expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null; // Previene render si no hay token hasta que el useEffect redirija

    return (
        <div className="min-h-screen flex bg-bg-app text-text-main overflow-hidden">
            {/* Left Side - Visual/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-20 bg-gradient-to-br from-green-950 via-bg-app to-black">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-[120px]"></div>
                </div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h1 className="text-6xl font-black tracking-tighter text-white mb-6">
                        COBRALO
                    </h1>
                    <p className="text-2xl text-slate-300 font-light max-w-lg leading-relaxed">
                        Casi listo. Ingresá tu <span className="text-green-400 font-medium italic">nueva contraseña</span> para volver al ruedo.
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <h1 className="text-3xl font-black text-green-500 italic tracking-tight">COBRALO</h1>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[32px] border border-slate-700 shadow-2xl relative overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white">
                                    Nueva Contraseña
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Por seguridad, asegurate de utilizar una contraseña fuerte y diferente a las anteriores.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 ml-1">NUEVA CONTRASEÑA</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    <p className="text-[10px] text-slate-500 ml-1 mt-1">Mínimo 8 caracteres, 1 mayúscula y 1 número.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 ml-1">CONFIRMAR CONTRASEÑA</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className={`w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder:text-slate-600 focus:ring-2 outline-none transition ${
                                                    confirmPassword && password !== confirmPassword 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-slate-700 focus:ring-green-500'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            Guardar y Entrar
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
