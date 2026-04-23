import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Building2, Briefcase, ChevronLeft, Sparkles, Smartphone, Eye, EyeOff, Check, DollarSign, Plus, Banknote, Trash2 } from 'lucide-react';
import LegalModal from '../components/LegalModal';



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
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    // Temp token for new Google users — only persisted to localStorage after wizard completes
    const [tempGoogleToken, setTempGoogleToken] = useState<string | null>(null);
    
    // Handle Google OAuth token from URL
    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        const isNew = searchParams.get('isNew') === 'true';
        const gname = searchParams.get('gname') || '';
        const gemail = searchParams.get('gemail') || '';
        
        if (token) {
            if (isNew) {
                // New Google user: keep token in memory ONLY — do NOT persist to localStorage yet.
                // It will be saved after the wizard is fully completed.
                setTempGoogleToken(token);
                setIsGoogleUser(true);
                setIsRegister(true);
                setFormData(prev => ({
                    ...prev,
                    name: decodeURIComponent(gname),
                    email: decodeURIComponent(gemail),
                }));
                setStep(2);
                // Clean URL without reloading
                window.history.replaceState({}, '', '/app/login?register=true');
            } else {
                // Existing user: persist token and go to dashboard
                localStorage.setItem('token', token);
                window.location.href = '/app/dashboard';
            }
        } else if (error) {
            showToast.error('Error al iniciar sesión con Google. Intentá de nuevo.');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Legal Modal state
    const [showLegalModal, setShowLegalModal] = useState(false);
    const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        bizName: '',
        businessCategory: '',
        phoneNumber: '',
        paymentAlias: ''
    });

    const [selectedServices, setSelectedServices] = useState<{name: string, price: number}[]>([{name: '', price: 10000}]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-app">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (isAuthenticated && !isGoogleUser) {
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
            if (!formData.name || !formData.bizName || !formData.businessCategory) {
                showToast.error('Nombre, Negocio y Categoría son requeridos');
                return;
            }
            if (selectedServices.length === 0 || !selectedServices[0].name) {
                // Initialize default empty if bypassed somehow
                setSelectedServices([{ name: '', price: 10000 }]);
            }
            setStep(3);
        } else if (step === 3) {
            if (selectedServices.length === 0 || !selectedServices[0].name.trim() || !selectedServices[0].price) {
                showToast.error('Por favor ingresa un nombre y precio para tu servicio');
                return;
            }
            setStep(4);
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
                        navigate(`/app/settings?checkout=${planParam}`);
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
            if (isGoogleUser) {
                // Google user: wizard completed — now persist the token and update profile
                if (!tempGoogleToken) {
                    showToast.error('Sesión expirada. Por favor, iniciá sesión con Google de nuevo.');
                    setIsLoading(false);
                    return;
                }
                const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tempGoogleToken}` },
                    body: JSON.stringify({
                        name: formData.name,
                        bizName: formData.bizName,
                        businessCategory: formData.businessCategory,
                        phoneNumber: formData.phoneNumber,
                    })
                });
                if (res.ok) {
                    // Save services if provided
                    if (selectedServices.length > 0 && selectedServices[0].name.trim()) {
                        await fetch(`${import.meta.env.VITE_API_URL || '/api'}/services/bulk`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tempGoogleToken}` },
                            body: JSON.stringify({ services: selectedServices })
                        }).catch(() => {});
                    }
                    // Wizard done: NOW persist the token so the user stays logged in
                    localStorage.setItem('token', tempGoogleToken);
                    showToast.success('¡Bienvenido a Cobralo!');
                    window.location.href = '/app/dashboard';
                } else {
                    showToast.error('Error al guardar tu perfil. Intentá de nuevo.');
                    setIsLoading(false);
                }
            } else {
                const result = await register(
                    formData.name, formData.email, formData.password, 
                    formData.bizName, formData.businessCategory, formData.phoneNumber, 
                    selectedServices, formData.paymentAlias
                );
                if (result.success) {
                    showToast.success('¡Cuenta creada exitosamente!');
                    if (planParam) {
                        navigate(`/app/settings?checkout=${planParam}`);
                    } else {
                        navigate('/app/dashboard');
                    }
                } else {
                    showToast.error(result.error || 'Error al registrar');
                }
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
            { label: 'Mayúscula', met: /[A-Z]/.test(password)},
            { label: 'Minúscula', met: /[a-z]/.test(password) },
            { label: 'Un número', met: /\d/.test(password) },
            { label: 'Carácter especial', met: /[@$!%*?&]/.test(password) }
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
        <div className="min-h-screen flex flex-col lg:flex-row text-text-main relative bg-bg-app overflow-x-hidden">
            
            {/* ═══════════════════════════════════════════════════
                GLOBAL BACKGROUND EFFECTS (Unified - Simpler)
            ═══════════════════════════════════════════════════ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-bg-app" />
                
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
                        <div className="w-9 h-9 rounded-xl bg-primary-main flex items-center justify-center font-black italic text-lg shrink-0 text-black shadow-lg shadow-emerald-500/20">C</div>
                        <span className="text-xl font-black italic tracking-tighter text-text-main">COBRALO</span>
                    </motion.div>
                </div>

                {/* Content or Magic Branding */}
                <AnimatePresence mode="wait">
                    {isRegister && step > 1 ? (
                        <motion.div
                            key="magic-branding"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative z-10 w-full max-w-[360px] xl:max-w-[400px] mx-auto mt-10 xl:mt-0"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-main/20 via-emerald-500/10 to-transparent blur-3xl -z-10 rounded-full" />
                            <div className="bg-surface dark:bg-white rounded-[32px] p-8 text-black shadow-2xl rotate-[-2deg] relative group transition-transform hover:rotate-0 duration-500 border border-border-main dark:border-transparent">
                                {/* Digital Receipt Preview */}
                                <div className="absolute -top-4 -right-4 bg-primary-main text-black text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                    Live Preview
                                </div>
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-black/5 rounded-[20px] mx-auto flex items-center justify-center mb-5 rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-inner">
                                        <span className="text-3xl font-black text-black/80">{formData.bizName ? formData.bizName.charAt(0).toUpperCase() : 'A'}</span>
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight leading-none mb-2">{formData.bizName || 'Tu Negocio'}</h3>
                                    <p className="text-sm text-zinc-500 font-bold uppercase tracking-wider">{formData.businessCategory || 'Categoría'}</p>
                                </div>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="bg-zinc-50/80 p-5 rounded-2xl border border-zinc-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Servicio</span>
                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Valor</span>
                                        </div>
                                        {selectedServices.length > 0 ? (
                                            selectedServices.slice(0,3).map((s, i) => (
                                                <div key={i} className="flex justify-between items-center py-2.5 border-b border-zinc-100 last:border-0 last:pb-0">
                                                    <span className="text-[15px] font-bold text-zinc-800">{s.name}</span>
                                                    <span className="text-[15px] font-black text-emerald-600">${s.price.toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 last:border-0 last:pb-0">
                                                <span className="text-[15px] font-bold text-zinc-800">Cuota Mensual</span>
                                                <span className="text-[15px] font-black text-emerald-600">$10.000</span>
                                            </div>
                                        )}
                                        {selectedServices.length > 3 && (
                                            <div className="text-xs text-center text-zinc-400 font-bold mt-2 pt-2 border-t border-zinc-100">
                                                + {selectedServices.length - 3} servicios más
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t-[3px] border-dashed border-zinc-200 pt-5 flex justify-between items-end">
                                    <span className="text-sm font-bold text-zinc-400">Total a Pagar</span>
                                    <span className="text-3xl font-black tracking-tighter">${selectedServices.length > 0 ? selectedServices[0].price.toLocaleString() : '10.000'}</span>
                                </div>
                                
                                <div className="mt-8 flex gap-2.5">
                                    <div className="h-12 flex-1 bg-black text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md">Pagar ahora</div>
                                </div>
                            </div>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-center text-zinc-500 font-medium text-sm flex flex-col items-center gap-2"
                            >
                                Así verán el portal de pagos tus clientes.
                                <div className="flex gap-1.5 opacity-50">
                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500" />)}
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="marketing"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6 }}
                            className="relative z-10 max-w-lg"
                        >
                            <div className="inline-flex items-center gap-2 bg-primary-main/10 border border-primary-main/20 rounded-full px-4 py-1.5 mb-6">
                                <Sparkles size={12} className="text-primary-main" />
                                <span className="text-[11px] font-black text-primary-main uppercase tracking-widest">Para tu negocio</span>
                            </div>
                            
                            <h1 className="text-5xl xl:text-6xl font-black tracking-tighter text-text-main leading-[1.05] mb-6">
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
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════════════
                RIGHT PANEL — Auth Form (Simplified)
            ═══════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center p-6 py-12 sm:py-20 lg:p-10 relative z-10 min-h-screen">

                <div className="w-full max-w-[400px] mx-auto">
                    
                    {/* Mobile logo */}
                    <div className="mb-8 lg:hidden flex items-center gap-3 justify-center">
                        <div className="w-8 h-8 rounded-lg bg-primary-main flex items-center justify-center font-black italic text-lg text-black">C</div>
                        <span className="text-xl font-black italic tracking-tighter text-text-main">COBRALO</span>
                    </div>

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-text-main tracking-tight">
                            {isRegister ? (
                                step === 1 ? 'Crear cuenta' : step === 2 ? 'Tu Negocio' : step === 3 ? 'Servicios' : 'Finalizar'
                            ) : 'Bienvenido de vuelta'}
                        </h2>
                        <p className="text-text-muted font-medium mt-1 text-sm">
                            {isRegister ? `Paso ${step} de 4 — casi listo` : 'Ingresá a tu panel de control'}
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-border-main dark:border-white/[0.08] relative overflow-hidden bg-surface/80 dark:bg-black/40 backdrop-blur-3xl shadow-2xl">

                        {/* Progress bar */}
                        {isRegister && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-main to-emerald-500"
                                    animate={{ width: `${(step / 4) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        )}

                        <div className="p-7 sm:p-8">
                            <form onSubmit={(e) => {
                                if (isRegister && step < 4) { e.preventDefault(); handleNextStep(); }
                                else { handleSubmit(e); }
                            }} className="space-y-4 pt-1">

                                <AnimatePresence mode="wait" custom={step}>
                                    {/* ── STEP 1: Email + Password ── */}
                                    {step === 1 && (
                                        <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                                            
                                            <button
                                                type="button"
                                                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google`}
                                                className="w-full py-3.5 px-4 bg-white dark:bg-white hover:bg-zinc-50 dark:hover:bg-zinc-100 border border-zinc-200 dark:border-transparent rounded-2xl text-black font-bold flex items-center justify-center gap-3 transition-colors shadow-sm"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                                Continuar con Google
                                            </button>

                                            <div className="relative flex items-center py-2">
                                                <div className="flex-grow border-t border-border-main dark:border-white/[0.08]"></div>
                                                <span className="flex-shrink-0 mx-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">O con tu email</span>
                                                <div className="flex-grow border-t border-border-main dark:border-white/[0.08]"></div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        required
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium"
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
                                                        className="w-full pl-10 pr-12 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium"
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
                                                            className={`w-full pl-10 pr-12 py-3.5 bg-black/5 dark:bg-white/[0.03] border rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 outline-none transition text-sm font-medium ${
                                                                formData.confirmPassword && formData.password !== formData.confirmPassword
                                                                    ? 'border-red-500/40 focus:ring-red-500/40 focus:border-red-500/40'
                                                                    : 'border-border-main dark:border-white/[0.08] focus:ring-primary-main/50 focus:border-primary-main/50'
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

                                    {/* ── STEP 2: Name + Business + Category ── */}
                                    {step === 2 && isRegister && (
                                        <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Nombre Completo</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Tu nombre" required value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Nombre del Negocio</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Nombre de la empresa" required value={formData.bizName}
                                                        onChange={e => setFormData({ ...formData, bizName: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Teléfono (WhatsApp)</label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Número de teléfono" value={formData.phoneNumber}
                                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 pt-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">¿A qué se dedica el negocio?</label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Rubro o actividad" required value={formData.businessCategory}
                                                        onChange={e => setFormData({ ...formData, businessCategory: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── STEP 3: Smart Templates (Services) ── */}
                                    {step === 3 && isRegister && (
                                        <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-5">
                                            <div className="flex flex-col items-center justify-center pt-2 pb-6">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-main/10 text-primary-main flex items-center justify-center mb-4">
                                                    <DollarSign size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold text-white text-center mb-1">Configurá tu servicio</h3>
                                                <p className="text-xs text-zinc-400 text-center max-w-[250px]">
                                                    Creá el principal producto o servicio por el que vas a cobrar.
                                                </p>
                                            </div>

                                            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                                                <AnimatePresence>
                                                {selectedServices.map((service, idx) => (
                                                    <motion.div 
                                                        key={`service-${idx}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                                                        transition={{ duration: 0.2 }}
                                                        className="p-5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] focus-within:border-primary-main/30 focus-within:bg-black/[0.08] dark:focus-within:bg-white/[0.05] transition-all rounded-2xl space-y-4 relative overflow-hidden group"
                                                    >
                                                        <div className="absolute right-0 top-0 w-32 h-32 bg-primary-main/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-focus-within:bg-primary-main/20 transition-colors duration-500" />
                                                        
                                                        {selectedServices.length > 1 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setSelectedServices(prev => prev.filter((_, i) => i !== idx))}
                                                                className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors z-20"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}

                                                        <div className="space-y-1.5 relative z-10 pr-6">
                                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Servicio</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="Nombre del Servicio" 
                                                                value={service.name} 
                                                                onChange={(e) => {
                                                                    const newSvcs = [...selectedServices];
                                                                    newSvcs[idx].name = e.target.value;
                                                                    setSelectedServices(newSvcs);
                                                                }}
                                                                className="w-full bg-transparent border-b-2 border-white/10 focus:border-primary-main text-white placeholder:text-zinc-600 text-lg font-bold py-2 outline-none transition-colors" 
                                                            />
                                                            {/* <p className="text-[10px] text-zinc-500 pl-1 pt-1 leading-relaxed">El nombre exacto que tus clientes verán en la plataforma y recibos de pago.</p> */}
                                                        </div>

                                                        <div className="space-y-1.5 relative z-10 pr-6">
                                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Precio</label>
                                                            <div className="relative">
                                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-main font-bold text-xl">$</span>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="0"
                                                                    value={service.price === 0 ? '' : service.price} 
                                                                    onChange={(e) => {
                                                                        const newSvcs = [...selectedServices];
                                                                        newSvcs[idx].price = e.target.value ? Number(e.target.value) : 0;
                                                                        setSelectedServices(newSvcs);
                                                                    }}
                                                                    className="w-full bg-transparent pl-6 border-b-2 border-border-main dark:border-white/10 focus:border-primary-main text-text-main dark:text-white placeholder:text-text-muted/40 text-2xl font-black py-2 outline-none transition-colors" 
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-zinc-500 pl-1 pt-1 pb-1 leading-relaxed">Podrás modificar este monto puntual al momento de generar cualquier cobro individual.</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                </AnimatePresence>

                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedServices(prev => [...prev, { name: '', price: 10000 }])}
                                                    className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/10 hover:border-primary-main/50 hover:bg-white/[0.02] text-zinc-400 hover:text-white rounded-2xl transition-all group mt-2"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-main group-hover:text-black transition-colors">
                                                        <Plus size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-wider">Añadir otro servicio</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ── STEP 4: Payment Alias + Terms ── */}
                                    {step === 4 && isRegister && (
                                        <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="space-y-4">
                                            <div className="space-y-1.5 pt-1">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Alias / CBU (Opcional)</label>
                                                <div className="relative">
                                                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                                                    <input type="text" placeholder="Alias o CBU" value={formData.paymentAlias}
                                                        onChange={e => setFormData({ ...formData, paymentAlias: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3.5 bg-black/5 dark:bg-white/[0.03] border border-border-main dark:border-white/[0.08] rounded-2xl text-text-main dark:text-white placeholder:text-text-muted/40 focus:ring-1 focus:ring-primary-main/50 focus:border-primary-main/50 outline-none transition text-sm font-medium" />
                                                </div>
                                                <p className="text-[10px] text-zinc-500 pl-1">Tus clientes verán este alias al momento de pagar.</p>
                                            </div>

                                            <label className="flex items-start gap-3 cursor-pointer mt-4 pt-2">
                                                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                                                    className="mt-0.5 w-4 h-4 rounded appearance-none border border-white/20 checked:bg-primary-main checked:border-primary-main flex items-center justify-center relative after:content-[''] after:absolute after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-black after:rotate-45 after:-translate-y-0.5 checked:after:block after:hidden transition-colors" />
                                                <span className="text-xs text-zinc-500 leading-relaxed max-w-[280px]">
                                                    Acepto los{' '}
                                                    <button type="button" onClick={() => { setLegalType('terms'); setShowLegalModal(true); }} className="text-zinc-300 hover:text-primary-main font-bold outline-none">Términos de uso</button>
                                                    {' '}y{' '}
                                                    <button type="button" onClick={() => { setLegalType('privacy'); setShowLegalModal(true); }} className="text-zinc-300 hover:text-primary-main font-bold outline-none">Privacidad</button>.
                                                </span>
                                            </label>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-5">
                                    {isRegister && step > 1 && (
                                        <button type="button" onClick={handlePrevStep}
                                            className="h-12 px-4 bg-black/5 dark:bg-white/[0.05] hover:bg-black/10 dark:hover:bg-white/[0.1] text-text-main dark:text-white font-bold rounded-2xl transition flex items-center justify-center border border-border-main dark:border-white/[0.1]">
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <button type="submit"
                                        disabled={isLoading || (isRegister && step === 4 && !termsAccepted)}
                                        className="flex-1 h-12 font-black rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-primary-main to-green-600 text-black shadow-[0_4px_20px_rgba(34,197,94,0.3)]"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                {isRegister ? (step === 4 ? 'Comenzar ahora' : 'Continuar') : 'Ingresar'}
                                                {(!isRegister || step < 4) && <ArrowRight size={16} />}
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
                            className="text-text-muted hover:text-text-main transition text-sm font-medium">
                            {isRegister ? (
                                <>¿Ya tenés cuenta? <span className="text-text-main font-bold">Ingresá</span></>
                            ) : (
                                <>¿No tenés cuenta? <span className="text-primary-main font-black">Empezá gratis</span></>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Legal Modals */}
            <LegalModal 
                isOpen={showLegalModal} 
                onClose={() => setShowLegalModal(false)} 
                type={legalType} 
            />
        </div>
    );
};

export default Login;
