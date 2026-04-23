import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { api } from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            showToast.error('Por favor ingresá tu email');
            return;
        }

        setIsLoading(true);
        try {
            await api.forgotPassword(email);
            // Siempre mostramos éxito para no revelar si el email existe o no (seguridad estándar)
            setIsSent(true);
            showToast.success('Si el email es válido, recibirás un correo.');
        } catch (error: any) {
            showToast.error(error.message || 'Hubo un error al procesar tu solicitud');
        } finally {
            setIsLoading(false);
        }
    };

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
                        Recuperá el acceso a tu cuenta de forma <span className="text-green-400 font-medium italic">segura</span> y rápida.
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
                        {isSent ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                    <Send className="text-green-400" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Revisá tu correo</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Te hemos enviado un enlace para restablecer tu contraseña a <span className="font-semibold text-white">{email}</span>.
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-6">
                                        Si no lo encuentras, revisá tu carpeta de correo no deseado (spam). El enlace expirará en 1 hora.
                                    </p>
                                    <button
                                        onClick={() => navigate('/app/login')}
                                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
                                    >
                                        Volver al inicio de sesión
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white">
                                        Recuperar Contraseña
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Ingresá el email asociado a tu cuenta y te enviaremos las instrucciones.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 ml-1">EMAIL</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="email"
                                                placeholder="Tu email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            'Enviar Enlace'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/app/login')}
                                        className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition w-full"
                                    >
                                        <ArrowLeft size={16} />
                                        <span className="text-sm font-medium">Volver a inicio de sesión</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
