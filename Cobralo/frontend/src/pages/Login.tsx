import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Building2, Briefcase, ChevronLeft, CheckCircle2, Sparkles, Smartphone } from 'lucide-react';

const Login = () => {

    const navigate = useNavigate();
    const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        bizName: '',
        businessCategory: '',
        phoneNumber: ''
    });

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#051105]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const validateStep1 = () => {
        if (!formData.email || !formData.password || (isRegister && !formData.confirmPassword)) {
            showToast.error('Por favor completa todos los campos');
            return false;
        }
        if (isRegister && formData.password !== formData.confirmPassword) {
            showToast.error('Las contraseñas no coinciden');
            return false;
        }
        if (formData.password.length < 6) {
            showToast.error('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else if (step === 2) {
            if (!formData.name || !formData.bizName) {
                showToast.error('Nombre y Negocio son requeridos');
                return;
            }
            setStep(3);
        }
    };

    const handlePrevStep = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isRegister) {
            setIsLoading(true);
            try {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    showToast.success('¡Bienvenido!');
                    navigate('/');
                } else {
                    showToast.error(result.error || 'Credenciales inválidas');
                }
            } catch {
                showToast.error('Error de conexión');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Registration final submit (Step 3)
        setIsLoading(true);
        try {
            const result = await register(
                formData.name, 
                formData.email, 
                formData.password, 
                formData.bizName, 
                formData.businessCategory,
                formData.phoneNumber
            );
            if (result.success) {
                showToast.success('¡Cuenta creada exitosamente!');
                navigate('/');
            } else {
                showToast.error(result.error || 'Error al registrar');
            }
        } catch {
            showToast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const stepVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen flex bg-[#051105] text-slate-200 overflow-hidden">
            {/* Left Side - Visual/Marketing */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-20 bg-gradient-to-br from-green-950 via-[#051105] to-black">
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
                        Gestioná tus clases y alumnos con una herramienta diseñada para <span className="text-green-400 font-medium italic">vos</span>.
                    </p>
                    
                    <div className="mt-12 space-y-6">
                        {[
                            'Control total de pagos y deudas',
                            'Calendario inteligente y asistencias',
                            'Recordatorios automáticos por WhatsApp',
                            'Reportes de ingresos por alumno'
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="flex items-center gap-3 text-slate-400"
                            >
                                <CheckCircle2 className="text-green-500" size={20} />
                                <span>{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md">
                    <div className="mb-10 lg:hidden">
                        <h1 className="text-3xl font-black text-green-500 italic tracking-tight">COBRALO</h1>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[32px] border border-slate-700 shadow-2xl relative overflow-hidden">
                        {/* Progress Bar (Registration only) */}
                        {isRegister && (
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-700/50">
                                <motion.div 
                                    className="h-full bg-green-500"
                                    animate={{ width: `${(step / 3) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {isRegister ? (
                                    step === 1 ? '¡Comencemos!' :
                                    step === 2 ? 'Sobre tu negocio' : 'Personalización'
                                ) : 'Bienvenido de nuevo'}
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                {isRegister ? `Paso ${step} de 3` : 'Ingresá tus credenciales para continuar'}
                            </p>
                        </div>

                        <form onSubmit={(e) => {
                            if (isRegister && step < 3) {
                                e.preventDefault();
                                handleNextStep();
                            } else {
                                handleSubmit(e);
                            }
                        }} className="space-y-4">
                            <AnimatePresence mode="wait" custom={step}>
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">EMAIL</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder="ejemplo@correo.com"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">CONTRASEÑA</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    required
                                                    minLength={6}
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        {isRegister && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-1.5"
                                            >
                                                <label className="text-xs font-semibold text-slate-400 ml-1">CONFIRMAR CONTRASEÑA</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                    <input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        required
                                                        value={formData.confirmPassword}
                                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border rounded-xl text-white placeholder:text-slate-600 focus:ring-2 outline-none transition ${
                                                            formData.confirmPassword && formData.password !== formData.confirmPassword 
                                                            ? 'border-red-500 focus:ring-red-500' 
                                                            : 'border-slate-700 focus:ring-green-500'
                                                        }`}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {step === 2 && isRegister && (
                                    <motion.div
                                        key="step2"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">TU NOMBRE</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Juan Pérez"
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">NOMBRE DE TU NEGOCIO</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Academia de Música X"
                                                    required
                                                    value={formData.bizName}
                                                    onChange={e => setFormData({ ...formData, bizName: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">TELÉFONO (WhatsApp)</label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="+54 9 1234 5678"
                                                    value={formData.phoneNumber}
                                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && isRegister && (
                                    <motion.div
                                        key="step3"
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-start gap-3 mb-2">
                                            <Sparkles className="text-green-400 shrink-0" size={20} />
                                            <p className="text-xs text-slate-300 leading-tight">
                                                Cuentanos qué hacés para que podamos personalizar tu experiencia.
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 ml-1">¿QUÉ CATEGORÍA DESCRIBE MEJOR LO QUE HACÉS?</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Ej: Música, Yoga, Idiomas..."
                                                    value={formData.businessCategory}
                                                    onChange={e => setFormData({ ...formData, businessCategory: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {['Música', 'Yoga', 'Idiomas', 'Deportes'].map(cat => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setFormData({...formData, businessCategory: cat})}
                                                        className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                                                            formData.businessCategory === cat 
                                                            ? 'bg-green-500 border-green-500 text-white' 
                                                            : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500'
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex gap-3 pt-2">
                                {isRegister && step > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="flex-1 bg-slate-700 hover:bg-slate-650 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft size={20} />
                                        Atrás
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            {isRegister ? (step === 3 ? 'Crear Cuenta' : 'Siguiente') : 'Ingresar'}
                                            {(!isRegister || step < 3) && <ArrowRight size={20} />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setStep(1);
                                }}
                                className="text-slate-400 hover:text-white transition text-sm"
                            >
                                {isRegister ? (
                                    <>¿Ya tenés cuenta? <span className="text-green-400 font-semibold underline underline-offset-4">Iniciá sesión</span></>
                                ) : (
                                    <>¿No tenés cuenta? <span className="text-green-400 font-semibold underline underline-offset-4">Registrate</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
