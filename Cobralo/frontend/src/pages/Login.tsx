import { useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Building2, Briefcase, ChevronLeft, Sparkles, Smartphone, Eye, EyeOff, Check } from 'lucide-react';

const Login = () => {

    const navigate = useNavigate();
    const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();

    const [searchParams] = useSearchParams();
    const [isRegister, setIsRegister] = useState(searchParams.get('tab') === 'register' || searchParams.get('register') === 'true');
    const planParam = searchParams.get('plan');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
            <div className="min-h-screen flex items-center justify-center bg-[#040d04]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/app/dashboard" replace />;
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            showToast.error('La contraseña no cumple con los requisitos de seguridad');
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

    const handlePrevStep = () => setStep(prev => Math.max(1, prev - 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isRegister) {
            setIsLoading(true);
            try {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    showToast.success('¡Bienvenido!');
                    if (planParam) {
                        navigate(`/settings?checkout=${planParam}`);
                    } else {
                        navigate('/app/dashboard');
                    }
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
        if (!termsAccepted) {
            showToast.error('Debés aceptar los Términos y Condiciones para continuar');
            return;
        }
        setIsLoading(true);
        try {
            const result = await register(formData.name, formData.email, formData.password, formData.bizName, formData.businessCategory, formData.phoneNumber);
            if (result.success) {
                showToast.success('¡Cuenta creada exitosamente!');
                if (planParam) {
                    navigate(`/settings?checkout=${planParam}`);
                } else {
                    navigate('/app/dashboard');
                }
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
        enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
    };

    const PasswordRequirements = ({ password }: { password: string }) => {
        const requirements = [
            { label: '8+ caracteres', met: password.length >= 8 },
            { label: 'Mayúscula y Minúscula', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
            { label: 'Un número', met: /\d/.test(password) },
            { label: 'Carácter especial (@$!%*?&)', met: /[@$!%*?&]/.test(password) }
        ];
        return (
            <div className="grid grid-cols-2 gap-2 mt-3 ml-1">
                {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${req.met ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-zinc-600'}`}>
                            <Check size={8} strokeWidth={4} className={req.met ? 'opacity-100' : 'opacity-0'} />
                        </div>
                        <span className={`text-[10px] font-medium transition-colors ${req.met ? 'text-green-400' : 'text-zinc-600'}`}>{req.label}</span>
                    </div>
                ))}
            </div>
        );
    };



    return (
        <div className="min-h-screen flex flex-col lg:flex-row text-zinc-300 relative bg-[#040d04] overflow-x-hidden">
            
            {/* ═══════════════════════════════════════════════════
                GLOBAL BACKGROUND EFFECTS (Unified - Simpler)
            ═══════════════════════════════════════════════════ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[#040d04]" />
                
                {/* Single Elegant Glow */}
                <motion.div 
                    animate={{ 
                        opacity: [0.1, 0.15, 0.1] 
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)', filter: 'blur(100px)' }} 
                />
                
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-30"
                    style={{ 
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', 
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
                    }} 
                />
            </div>

            {/* ═══════════════════════════════════════════════════
                LEFT PANEL — Visual / Marketing (Simplified)
            ═══════════════════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative flex-col justify-center p-12 xl:p-24 min-h-screen">
                {/* Top: Logo */}
                <div className="absolute top-10 xl:top-14 left-12 xl:left-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-9 h-9 rounded-xl bg-primary-main flex items-center justify-center font-black italic text-lg shrink-0 text-black">C</div>
                        <span className="text-xl font-black italic tracking-tighter text-white">COBRALO</span>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-primary-main/10 border border-primary-main/20 rounded-full px-4 py-1.5 mb-6">
                            <Sparkles size={12} className="text-primary-main" />
                            <span className="text-[11px] font-black text-primary-main uppercase tracking-widest">Para tu academia</span>
                        </div>
                        
                        <h1 className="text-5xl xl:text-6xl font-black tracking-tighter text-white leading-[1.05] mb-6">
                            Organizacion,<br />
                            <span className="text-primary-main">sin limites.</span>
                        </h1>
                        
                        <p className="text-lg text-zinc-400 font-medium mb-12 leading-relaxed">
                            Olvidate de las planillas. Automatizá tus cobros, asistencias y recordatorios en un solo lugar, diseñado para <span className="text-white italic">vos</span>.
                        </p>

                        <div className="space-y-6">
                            {[
                                'Control total de pagos y deudas en vivo.',
                                'Sincronización con Google & Apple Calendar.',
                                'Recordatorios automáticos por WhatsApp.',
                                'Reportes de ingresos claros y en tiempo real.'
                            ].map((feature, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                    className="flex items-center gap-4 text-zinc-300 group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary-main/10 flex items-center justify-center shrink-0 group-hover:bg-primary-main/20 transition-colors">
                                        <Check size={14} className="text-primary-main" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                RIGHT PANEL — Auth Form (Simplified)
            ═══════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center p-6 py-12 sm:py-20 lg:p-10 relative z-10 min-h-screen">

                <div className="w-full max-w-[400px] mx-auto">
                    
                    {/* Mobile logo */}
                    <div className="mb-8 lg:hidden flex items-center gap-3 justify-center">
                        <div className="w-8 h-8 rounded-lg bg-primary-main flex items-center justify-center font-black italic text-lg text-black">C</div>
                        <span className="text-xl font-black italic tracking-tighter text-white">COBRALO</span>
                    </div>

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {isRegister ? (
                                step === 1 ? 'Crear cuenta' : step === 2 ? 'Tu academia' : 'Personalización'
                            ) : 'Bienvenido de vuelta'}
                        </h2>
                        <p className="text-zinc-500 font-medium mt-1 text-sm">
                            {isRegister ? `Paso ${step} de 3 — casi listo` : 'Ingresá a tu panel de control'}
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-white/[0.08] relative overflow-hidden bg-black/40 backdrop-blur-3xl shadow-2xl">

                        {/* Progress bar */}
                        {isRegister && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-main to-emerald-500"
                                    animate={{ width: `${(step / 3) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        )}

                        <div className="p-7 sm:p-8">
                            <form onSubmit={(e) => {
                                if (isRegister && step < 3) { e.preventDefault(); handleNextStep(); }
                                else { handleSubmit(e); }
                            }} className="space-y-4 pt-1">

                                <AnimatePresence mode="wait" custom={step}>
                                    {/* ── STEP 1: Email + Password ── */}
                                    {step === 1 && (
                                        <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input
                                                        type="email"
                                                        placeholder="ejemplo@correo.com"
                                                        required
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Contraseña</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        required
                                                        value={formData.password}
                                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                        className="w-full pl-10 pr-12 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium"
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                    </button>
                                                </div>
                                                {isRegister && <PasswordRequirements password={formData.password} />}
                                                {!isRegister && (
                                                    <div className="text-right mt-1">
                                                        <button type="button" onClick={() => navigate('/app/forgot-password')}
                                                            className="text-[11px] font-bold text-primary-main hover:text-green-400 transition-colors">
                                                            ¿Olvidaste tu contraseña?
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isRegister && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 pt-1">
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Confirmar Contraseña</label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                        <input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            placeholder="••••••••"
                                                            required
                                                            value={formData.confirmPassword}
                                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                            className={`w-full pl-10 pr-12 py-3.5 bg-white/[0.03] border rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 outline-none transition text-sm font-medium ${
                                                                formData.confirmPassword && formData.password !== formData.confirmPassword
                                                                    ? 'border-red-500/40 focus:ring-red-500/40 focus:border-red-500/40'
                                                                    : 'border-white/[0.08] focus:ring-primary-main/50 focus:border-primary-main/50'
                                                            }`}
                                                        />
                                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                                                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* ── STEP 2: Name + Business ── */}
                                    {step === 2 && isRegister && (
                                        <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Tu Nombre</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Ej: Juan Pérez" required value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Nombre de tu Academia</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Ej: English Studio" required value={formData.bizName}
                                                        onChange={e => setFormData({ ...formData, bizName: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Teléfono (WhatsApp)</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="+54 9 11 1234 5678" value={formData.phoneNumber}
                                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── STEP 3: Category + Terms ── */}
                                    {step === 3 && isRegister && (
                                        <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-main/[0.08] border border-primary-main/20">
                                                <Sparkles className="text-primary-main shrink-0 mt-0.5" size={16} />
                                                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                                    Completá esto para personalizar tu experiencia con el sistema.
                                                </p>
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">¿Qué tipo de academia tenés?</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Ej: Clases de Guitarra" value={formData.businessCategory}
                                                        onChange={e => setFormData({ ...formData, businessCategory: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3 pl-1">
                                                    {['Música', 'Idiomas', 'Deportes', 'Tutoría', 'Arte', 'Danza'].map(cat => (
                                                        <button key={cat} type="button"
                                                            onClick={() => setFormData({ ...formData, businessCategory: cat })}
                                                            className={`text-[10px] font-black px-3 py-1.5 rounded-full border transition ${
                                                                formData.businessCategory === cat
                                                                    ? 'bg-primary-main/20 border-primary-main/40 text-primary-main'
                                                                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-500 hover:border-white/15 hover:text-zinc-300'
                                                            }`}>
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <label className="flex items-start gap-3 cursor-pointer mt-4 pt-2">
                                                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                                                    className="mt-0.5 w-4 h-4 rounded appearance-none border border-white/20 checked:bg-primary-main checked:border-primary-main flex items-center justify-center relative after:content-[''] after:absolute after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:-translate-y-0.5 checked:after:block after:hidden transition-colors" />
                                                <span className="text-xs text-zinc-500 leading-relaxed max-w-[280px]">
                                                    Acepto los{' '}
                                                    <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-primary-main font-bold">Términos de uso</a>
                                                    {' '}y{' '}
                                                    <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-primary-main font-bold">Privacidad</a>.
                                                </span>
                                            </label>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-5">
                                    {isRegister && step > 1 && (
                                        <button type="button" onClick={handlePrevStep}
                                            className="h-12 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold rounded-2xl transition flex items-center justify-center border border-white/[0.1]">
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <button type="submit"
                                        disabled={isLoading || (isRegister && step === 3 && !termsAccepted)}
                                        className="flex-1 h-12 font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-primary-main to-green-600 text-black shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                {isRegister ? (step === 3 ? 'Comenzar ahora' : 'Continuar') : 'Ingresar'}
                                                {(!isRegister || step < 3) && <ArrowRight size={16} />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button type="button"
                            onClick={() => { setIsRegister(!isRegister); setStep(1); }}
                            className="text-zinc-600 hover:text-zinc-400 transition text-sm font-medium">
                            {isRegister ? (
                                <>¿Ya tenés cuenta? <span className="text-white font-bold">Ingresá</span></>
                            ) : (
                                <>¿No tenés cuenta? <span className="text-primary-main font-black">Empezá gratis</span></>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
