import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
    User as UserIcon, 
    Shield, 
    CreditCard, 
    Save, 
    Building2, 
    Trash2,
    MessageSquare,
    Star,
    Zap,
    ExternalLink,
    RefreshCw,
    Eye,
    EyeOff,
    HelpCircle,
    FileText,
    Copy,
    Check,
    Instagram,
    Facebook,
    Menu
} from 'lucide-react';
import SupportModal from '../components/SupportModal';
import LegalModal from '../components/LegalModal';
import { showToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { ProFeature, ProBadge } from '../components/ProGuard';

const Settings = () => {
    const { updateUser: updateAuthUser, isPro } = useAuth();
    const { setTheme, theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'academy' | 'automation' | 'subscription' | 'ratings'>('profile');
    
    const [isTrimestral, setIsTrimestral] = useState(false);

    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [legalModal, setLegalModal] = useState<{ isOpen: boolean, type: 'terms' | 'privacy' }>({ isOpen: false, type: 'terms' });
    
    // Responsive navigation state
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    useEffect(() => {
        // On mobile, if a tab is selected via search params, close nav
        const checkoutPlan = searchParams.get('checkout');
        if (checkoutPlan && isMobile) {
            setIsNavOpen(false);
        }
    }, []);

    const categories = [
        { 
            id: 'general', 
            label: 'Mi Perfil', 
            icon: UserIcon, 
            tabs: [
                { id: 'profile', label: 'Datos Personales', icon: UserIcon, description: 'Información básica de tu cuenta.' },
                { id: 'security', label: 'Seguridad', icon: Shield, description: 'Actualizá tu contraseña y protegé tu cuenta.' }
            ] 
        },
        { 
            id: 'academy', 
            label: 'Mi Academia', 
            icon: Building2, 
            tabs: [
                { id: 'academy', label: 'Servicios y Marca', icon: Zap, description: 'Gestioná tu academia y perfil público.' },
                { id: 'ratings', label: 'Testimonios', icon: Star, description: 'Lo que tus alumnos dicen de vos.' }
            ] 
        },
        { 
            id: 'automation', 
            label: 'Automatización', 
            icon: MessageSquare, 
            tabs: [
                { id: 'automation', label: 'Pagos y Mensajes', icon: CreditCard, description: 'Automatizá tus cobros y recordatorios.' }
            ] 
        },
        { 
            id: 'subscription', 
            label: 'Mi Suscripción', 
            icon: CreditCard,
            tabs: [
                { id: 'subscription', label: 'Plan Actual', icon: Zap, description: 'Gestioná tu plan y facturación.' }
            ]
        },
        { 
            id: 'support', 
            label: 'Ayuda', 
            icon: HelpCircle, 
            tabs: [
                { id: 'support-trigger', label: 'Soporte Técnico', icon: HelpCircle, isAction: true, onClick: () => setIsSupportOpen(true), description: 'Contactá con nuestro equipo.' },
                { id: 'terms-trigger', label: 'Legales', icon: FileText, isAction: true, onClick: () => setLegalModal({ isOpen: true, type: 'terms' }), description: 'Términos y condiciones.' }
            ] 
        }
    ];

    // Helper to get active tab info
    const getAllTabs = () => categories.flatMap(c => c.tabs);
    const activeTabInfo = getAllTabs().find(t => (t as any).id === activeTab) as { label: string, description?: string } | undefined;
    const tab = activeTabInfo || { label: 'Ajustes', description: 'Personalizá tu experiencia.' };

    const handleUpgrade = async (planId: string) => {
        try {
            setLoadingCheckout(planId);
            const { checkoutUrl } = await api.createCheckoutSession(planId);
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                showToast.error('Error al iniciar pago');
            }
        } catch (error) {
            showToast.error('Error al generar el link de pago');
            console.error(error);
        } finally {
            setLoadingCheckout(null);
        }
    };
    
    const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [user, setUser] = useState<Partial<User>>({
        name: '', email: '', bizName: '', businessCategory: '', phoneNumber: '', taxId: '', billingAddress: '', bizAlias: '', reminderTemplate: 'Hola {alumno}! Te escribo de {negocio} para recordarte tu clase de {servicio}. El monto es de ${monto}. Saludos!',
        defaultPrice: 0, defaultService: 'General', defaultSurcharge: 10, currency: '$', receiptFooter: '',
        mpAccessToken: '', mpPublicKey: '', notificationsEnabled: true, isPublicProfileVisible: true,
        biography: '', photoUrl: '', instagramUrl: '', facebookUrl: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [userServices, setUserServices] = useState<any[]>([]);
    const [newService, setNewService] = useState({ name: '', defaultPrice: '' });
    const [ratings, setRatings] = useState<any[]>([]);
    const [ratingToken, setRatingToken] = useState<string | null>(null);
    const [ratingExpires, setRatingExpires] = useState<string | null>(null);

    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
    const [priceLastUpdate, setPriceLastUpdate] = useState<string | null>(null);
    const [pendingAdjustment, setPendingAdjustment] = useState<any>(null);
    const [studentCount, setStudentCount] = useState(0);
    const [scheduleCount, setScheduleCount] = useState(0);
    const [hasRecentPayments, setHasRecentPayments] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchUserServices();
        fetchRatings();
        fetchSubscriptionPlans();
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const [students, schedules, payments] = await Promise.all([
                api.getStudents(),
                api.getSchedules(),
                api.getPayments()
            ]);
            
            setStudentCount(students.length);
            setScheduleCount(schedules.length);
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recent = payments.some(p => new Date(p.paidAt) >= thirtyDaysAgo);
            setHasRecentPayments(recent);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    const fetchSubscriptionPlans = async () => {
        try {
            const data = await api.getSubscriptionPlans?.() || { plans: [], pendingAdjustment: null };
            setSubscriptionPlans(data.plans || []);
            setPriceLastUpdate(data.lastUpdate);
            setPendingAdjustment(data.pendingAdjustment);
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    // Auto-launch checkout if arriving from landing page Pro plan button
    const [searchParams] = useSearchParams();
    const autoCheckoutDone = React.useRef(false);
    useEffect(() => {
        const checkoutPlan = searchParams.get('checkout');
        if (checkoutPlan && !loading && !autoCheckoutDone.current) {
            autoCheckoutDone.current = true;
            setActiveTab('subscription');
            handleUpgrade(checkoutPlan);
        }
    }, [loading]);

    const fetchRatings = async () => {
        try {
            const data = await api.getMyRatings();
            setRatings(data);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleGenerateLink = async () => {
        try {
            const data = await api.generateRatingLink();
            setRatingToken(data.token);
            setRatingExpires(data.expires);
            showToast.success('¡Link generado con éxito!');
        } catch (error) {
            showToast.error('Error al generar el link');
        }
    };

    const fetchUserServices = async () => {
        try {
            const data = await api.getServices();
            setUserServices(data);
        } catch (error) {
            console.error('Error fetching user services:', error);
        }
    };

    const handleAddService = async () => {
        if (!newService.name || !newService.defaultPrice) return;
        try {
            const added = await api.createService({ 
                name: newService.name, 
                defaultPrice: Number(newService.defaultPrice) 
            });
            setUserServices([...userServices, added]);
            setNewService({ name: '', defaultPrice: '' });
            showToast.success('Servicio agregado');
        } catch (error) {
            showToast.error('Error al agregar servicio');
        }
    };

    const handleDeleteService = async (id: number) => {
        try {
            await api.deleteService(id);
            setUserServices(userServices.filter(s => s.id !== id));
            showToast.success('Servicio eliminado');
        } catch (error) {
            showToast.error('Error al eliminar servicio');
        }
    };

    const fetchProfile = async () => {
        try {
            const data = await api.getProfile();
            setUser({
                ...data,
                notificationsEnabled: data.notificationsEnabled ?? true,
                isPublicProfileVisible: data.isPublicProfileVisible ?? true
            });
            setRatingToken(data.ratingToken || null);
            setRatingExpires(data.ratingTokenExpires || null);
        } catch (error) {
            showToast.error('Error al cargar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRatingVisibility = async (id: number) => {
        try {
            await api.toggleRatingComment(id);
            setRatings(ratings.map(r => r.id === id ? { ...r, showComment: !r.showComment } : r));
            showToast.success('Visibilidad actualizada');
        } catch (error) {
            showToast.error('Error al actualizar visibilidad');
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const updated = await api.updateProfile(user);
            showToast.success('¡Configuración guardada!');
            updateAuthUser(updated);
        } catch (error) {
            showToast.error('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast.error('Las contraseñas no coinciden');
            return;
        }
        setChangingPassword(true);
        try {
            await api.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showToast.success('Contraseña actualizada correctamente');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showToast.error(error.message || 'Error al cambiar contraseña');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) return <Layout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div></div></Layout>;

    return (
        <Layout>
            <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-4 mb-2">
                    {!isNavOpen && (
                        <button 
                            onClick={() => setIsNavOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-zinc-100 dark:bg-bg-soft text-primary-main hover:bg-primary-main/10 transition-all active:scale-90"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-emerald-50 tracking-tight leading-none uppercase">Configuración</h1>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg tracking-tight">Personalizá tu experiencia y gestioná tu academia.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Navigation Sidebar */}
                <motion.div 
                    animate={{ width: isMobile ? '100%' : (isCollapsed ? '80px' : '25%') }}
                    className={`lg:sticky lg:top-24 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 ${!isNavOpen ? 'hidden lg:block' : 'block'}`}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                             <h3 className={`text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-[0.2em] ml-4 transition-opacity duration-300 ${isCollapsed && !isMobile ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}>
                                Navegación
                            </h3>
                            <button 
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden lg:flex p-2 rounded-xl bg-zinc-50 dark:bg-bg-dark text-text-muted hover:text-primary-main transition-colors mr-2"
                                title={isCollapsed ? "Expandir" : "Contraer"}
                            >
                                <Menu size={14} />
                            </button>
                        </div>

                        {categories.map(cat => (
                            <div key={cat.id} className="space-y-1 mb-6">
                                {!isCollapsed || isMobile ? (
                                    <h4 className="text-[9px] font-black text-zinc-300 dark:text-emerald-500/20 uppercase tracking-[0.2em] ml-4 mb-2">
                                        {cat.label}
                                    </h4>
                                ) : (
                                    <div className="h-px bg-zinc-100 dark:bg-white/5 mx-4 mb-4" />
                                )}
                                
                                <div className="flex flex-col gap-1">
                                    {cat.tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                if ((tab as any).isAction) {
                                                    (tab as any).onClick();
                                                } else {
                                                    setActiveTab(tab.id as any);
                                                    if (window.innerWidth < 1024) setIsNavOpen(false);
                                                }
                                            }}
                                            title={isCollapsed ? tab.label : ""}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] group ${
                                                activeTab === tab.id
                                                    ? 'bg-primary-main text-white shadow-lg shadow-primary-glow dark:shadow-none translate-x-1'
                                                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-bg-soft hover:text-zinc-800 dark:hover:text-emerald-50'
                                            } ${isCollapsed && !isMobile ? 'justify-center px-0 w-12 mx-auto' : ''}`}
                                        >
                                            <tab.icon size={18} className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100 transition-opacity'}`} />
                                            {(!isCollapsed || isMobile) && (
                                                <span className="truncate">{tab.label}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Content Area */}
                <div className={`flex-1 bg-white dark:bg-bg-soft rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 dark:border-border-emerald min-h-[600px] animate-in fade-in slide-in-from-right-4 duration-700 ${isNavOpen ? 'hidden lg:block' : 'block'} w-full`}>
                    
                    {/* Breadcrumb / Section Header for Mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-10 pb-6 border-b border-zinc-100 dark:border-white/5">
                        <button 
                            onClick={() => setIsNavOpen(true)}
                            className="p-3 rounded-2xl bg-zinc-50 dark:bg-bg-dark text-text-muted hover:text-primary-main transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
                        >
                            <Menu size={16} /> Ver Secciones
                        </button>
                        <div className="h-4 w-px bg-zinc-200 dark:bg-white/10"></div>
                        <span className="text-[10px] font-black text-primary-main uppercase tracking-widest">
                            {tab.label}
                        </span>
                    </div>
                    
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3 text-primary-main/40 dark:text-emerald-500/30 mb-2">
                                    <UserIcon size={20} />
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] underline decoration-primary-main/20 underline-offset-8">{(tab as any).label}</h2>
                                </div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">{(tab as any).description || 'Información básica de tu cuenta.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-inner">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none"
                                        value={user.name}
                                        onChange={e => setUser({ ...user, name: e.target.value })}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Email de Acceso</label>
                                    <input
                                        type="email"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 placeholder-zinc-300 shadow-sm focus:ring-2 focus:ring-primary-main/20 transition-all outline-none"
                                        value={user.email}
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
                                                        ? 'bg-primary-main text-white shadow-lg shadow-primary-glow translate-z-1' 
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
                                    className="bg-primary-main text-white font-black py-5 px-14 rounded-[28px] shadow-xl shadow-primary-glow hover:bg-green-600 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Perfil</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ACADEMY TAB */}
                    {activeTab === 'academy' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* IPC Notice Banner */}
                            {pendingAdjustment && (
                                <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-[32px] flex flex-col md:flex-row items-center gap-6 shadow-sm">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div className="flex-1 space-y-1 text-center md:text-left">
                                        <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Pr\u00f3ximo Ajuste por Inflaci\u00f3n (IPC)</h3>
                                        <p className="text-xs font-bold text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                                            Seg\u00fan nuestros t\u00e9rminos, el pr\u00f3ximo {new Date(pendingAdjustment.effectiveDate).toLocaleDateString()} los planes se ajustar\u00e1n un **{pendingAdjustment.percentage}%** (50% del IPC de {pendingAdjustment.monthName}).
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
                                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        Ver T\u00e9rminos
                                    </button>
                                </div>
                            )}

                            {/* Visibility Header Card */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-main/20 via-amber-400/20 to-primary-main/20 rounded-[48px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative p-10 bg-white dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-xl overflow-hidden">
                                    <div className="flex flex-col lg:flex-row gap-10 items-center">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 rounded-full bg-primary-main/10 border border-primary-main/20 text-[10px] font-black text-primary-main uppercase tracking-widest">Estado: Landing Page</div>
                                                {isPro && <div className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">Habilitado Pro</div>}
                                            </div>
                                            <h2 className="text-3xl font-black text-zinc-900 dark:text-emerald-50 leading-tight uppercase">Tu camino a ser <span className="text-primary-main underline decoration-primary-main/20">Destacado</span></h2>
                                            <p className="text-sm font-bold text-text-muted leading-relaxed max-w-md">Completá estos objetivos para que tu academia aparezca en la página principal y atraigas más alumnos.</p>
                                            
                                            {/* Progress Bar */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nivel de Visibilidad</span>
                                                    <span className="text-2xl font-black text-primary-main font-mono">
                                                        {Math.round(
                                                            (isPro ? 20 : 0) + 
                                                            (user.bizName && user.businessCategory ? 20 : 0) + 
                                                            (studentCount >= 10 ? 20 : 0) + 
                                                            (scheduleCount >= 4 ? 20 : 0) + 
                                                            (hasRecentPayments ? 20 : 0)
                                                        )}%
                                                    </span>
                                                </div>
                                                <div className="h-4 w-full bg-zinc-100 dark:bg-bg-soft rounded-full overflow-hidden p-1 shadow-inner border border-zinc-200/50 dark:border-white/5">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-primary-main to-emerald-400 rounded-full transition-all duration-1000 shadow-lg shadow-primary-glow"
                                                        style={{ width: `${(isPro ? 20 : 0) + (user.bizName && user.businessCategory ? 20 : 0) + (studentCount >= 10 ? 20 : 0) + (scheduleCount >= 4 ? 20 : 0) + (hasRecentPayments ? 20 : 0)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-80 grid grid-cols-1 gap-2">
                                            {[
                                                { label: 'Suscripción Pro Activa', active: isPro, icon: Zap, color: 'text-amber-500' },
                                                { label: 'Perfil Completo (Nombre/Bio)', active: !!(user.bizName && user.businessCategory), icon: UserIcon, color: 'text-blue-500' },
                                                { label: '10+ Alumnos Activos', active: studentCount >= 10, count: studentCount, target: 10, icon: UserIcon, color: 'text-primary-main' },
                                                { label: 'Calendario Configurado', active: scheduleCount >= 4, count: scheduleCount, target: 4, icon: Star, color: 'text-emerald-500' },
                                                { label: 'Cobro Registrado (30 días)', active: hasRecentPayments, icon: CreditCard, color: 'text-purple-500' }
                                            ].map((item, i) => (
                                                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${item.active ? 'bg-primary-main/[0.03] border-primary-main/10' : 'bg-zinc-50/50 dark:bg-bg-soft/20 border-transparent grayscale opacity-60'}`}>
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.active ? 'bg-primary-main text-white' : 'bg-zinc-200 dark:bg-bg-soft text-zinc-400'}`}>
                                                        {item.active ? <Check size={16} /> : <item.icon size={16} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${item.active ? 'text-zinc-800 dark:text-emerald-50' : 'text-zinc-400'}`}>{item.label}</p>
                                                        {item.target && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="h-1 flex-1 bg-zinc-200 dark:bg-bg-soft rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary-main" style={{ width: `${Math.min(100, (item.count! / item.target) * 100)}%` }}></div>
                                                                </div>
                                                                <span className="text-[8px] font-black text-zinc-400">{item.count}/{item.target}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                                        <Building2 size={24} className="text-primary-main" /> Mi Marca y Servicios
                                    </h2>
                                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Gestioná tu academia y perfil público.</p>
                                </div>
                                <ProFeature featureName="Perfil Público" inline>
                                    <button 
                                        onClick={() => setUser({ ...user, isPublicProfileVisible: !user.isPublicProfileVisible })}
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 border ${user.isPublicProfileVisible ? 'bg-primary-main/10 text-primary-main border-primary-main/30' : 'bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-bg-dark font-accent'}`}
                                    >
                                        {user.isPublicProfileVisible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Privado</>}
                                    </button>
                                </ProFeature>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Nombre de la Academia</label>
                                    <input
                                        type="text"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none"
                                        value={user.bizName}
                                        onChange={e => setUser({ ...user, bizName: e.target.value })}
                                        placeholder="Ej: Academia Pro"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Categor\u00eda / Especialidad</label>
                                    <input
                                        type="text"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none"
                                        value={user.businessCategory}
                                        onChange={e => setUser({ ...user, businessCategory: e.target.value })}
                                        placeholder="Ej: Fitness, M\u00fasica..."
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Biograf\u00eda / Descripci\u00f3n (M\u00edn. 100 caracteres para landing)</label>
                                    <textarea
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none min-h-[120px]"
                                        value={user.biography || ''}
                                        onChange={e => setUser({ ...user, biography: e.target.value })}
                                        placeholder="Contanos sobre tu academia, tus clases y tu experiencia..."
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">URL de Foto de Perfil</label>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-bg-soft flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-white/5">
                                            {user.photoUrl ? <img src={user.photoUrl} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-zinc-300" />}
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none"
                                            value={user.photoUrl || ''}
                                            onChange={e => setUser({ ...user, photoUrl: e.target.value })}
                                            placeholder="https://ejemplo.com/tu-foto.jpg"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest flex items-center gap-2">
                                        <Instagram size={12} /> Instagram (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none"
                                        value={user.instagramUrl || ''}
                                        onChange={e => setUser({ ...user, instagramUrl: e.target.value })}
                                        placeholder="@tu.usuario"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest flex items-center gap-2">
                                        <Facebook size={12} /> Facebook (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none"
                                        value={user.facebookUrl || ''}
                                        onChange={e => setUser({ ...user, facebookUrl: e.target.value })}
                                        placeholder="facebook.com/tu.pagina"
                                    />
                                </div>
                                <div className="md:col-span-2 p-1 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-border-emerald/30 dark:to-emerald-500/10 rounded-[3.5rem] shadow-sm">
                                    <div className="bg-white dark:bg-bg-soft rounded-[3.4rem] p-10 space-y-10">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="w-14 h-14 rounded-3xl bg-primary-main/10 flex items-center justify-center text-primary-main shadow-inner rotate-3">
                                                    <Zap size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tighter">Servicios Ofrecidos</h3>
                                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Configurá tus clases y aranceles para los alumnos</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                                <div className="relative group w-full sm:flex-1 md:w-64">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: Clase de Yoga" 
                                                        className="w-full bg-zinc-50 dark:bg-bg-dark p-4 px-6 rounded-2xl text-sm font-bold border border-transparent focus:border-primary-main/30 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-zinc-700 dark:text-white"
                                                        value={newService.name}
                                                        onChange={e => setNewService({...newService, name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="relative group w-full sm:w-32">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">$</div>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0" 
                                                        className="w-full bg-zinc-50 dark:bg-bg-dark p-4 pl-8 pr-6 rounded-2xl text-sm font-bold border border-transparent focus:border-primary-main/30 focus:ring-4 focus:ring-primary-main/5 transition-all outline-none text-zinc-700 dark:text-white"
                                                        value={newService.defaultPrice}
                                                        onChange={e => setNewService({...newService, defaultPrice: e.target.value})}
                                                    />
                                                </div>
                                                <button 
                                                    onClick={handleAddService} 
                                                    className="w-full sm:w-auto bg-primary-main text-white p-4 px-8 rounded-2xl hover:bg-green-600 transition-all shadow-xl shadow-primary-glow flex items-center justify-center gap-2 active:scale-95 group whitespace-nowrap"
                                                >
                                                    <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Agregar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userServices.length === 0 ? (
                                            <div className="md:col-span-2 py-10 border-2 border-dashed border-zinc-100 dark:border-border-emerald/20 rounded-[32px] text-center">
                                                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">No tenés servicios cargados</p>
                                            </div>
                                        ) : (
                                            userServices.map(service => (
                                                <div key={service.id} className="flex items-center justify-between p-5 bg-zinc-50/50 dark:bg-bg-dark/40 rounded-[28px] border border-zinc-100 dark:border-border-emerald/10 group hover:border-primary-main/20 hover:bg-zinc-50 dark:hover:bg-bg-dark transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-bg-soft flex items-center justify-center text-primary-main shadow-sm border border-zinc-100 dark:border-border-emerald/30 group-hover:scale-110 transition-transform">
                                                            <Star size={20} className="fill-primary-main/10" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-zinc-800 dark:text-emerald-50 text-sm tracking-tight">{service.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-black text-primary-main uppercase tracking-widest bg-primary-main/10 px-2 py-0.5 rounded-lg">
                                                                    {user.currency}{Number(service.defaultPrice).toLocaleString('es-AR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteService(service.id)} 
                                                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Eliminar servicio"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ProFeature featureName="Perfil Público" inline>
                                <div className="p-8 bg-primary-main/5 dark:bg-emerald-500/5 rounded-[40px] border border-primary-main/10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-main text-white flex items-center justify-center shadow-lg shadow-primary-glow">
                                            <ExternalLink size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Tu Perfil Público</p>
                                            <p className="text-xs font-bold text-primary-main/60 tracking-tight">{window.location.origin}/app/profile/{user.bizAlias || user.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/app/profile/${user.bizAlias || user.id}`);
                                            showToast.success('¡Copiado!');
                                        }}
                                        className="px-8 py-4 bg-white dark:bg-bg-soft text-zinc-900 dark:text-emerald-50 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-zinc-100 dark:border-border-emerald hover:bg-zinc-50 transition shadow-sm"
                                    >
                                        Copiar Link
                                    </button>
                                </div>
                            </ProFeature>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="bg-primary-main text-white font-black py-5 px-14 rounded-[28px] shadow-xl shadow-primary-glow flex items-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Academia</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AUTOMATION TAB */}
                    {activeTab === 'automation' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                                    <MessageSquare size={24} className="text-primary-main" /> Automatización y Pagos
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Simplificá tu gestión y cobros.</p>
                            </div>

                            <div className="p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-inner space-y-8">
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
                                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                <div className="h-px bg-zinc-200/50 dark:bg-emerald-500/10"></div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-4 ml-4 tracking-widest">Plantilla de WhatsApp Pro</label>
                                    <textarea
                                        className="w-full p-8 bg-white dark:bg-bg-soft dark:text-white rounded-[32px] border-none focus:ring-2 focus:ring-primary-main/20 outline-none font-bold text-zinc-700 shadow-sm min-h-[160px] leading-relaxed"
                                        value={user.reminderTemplate}
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
                            
                            <div className="p-10 bg-blue-50/30 dark:bg-blue-500/5 rounded-[48px] border border-blue-100/50 dark:border-blue-500/10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-blue-700 dark:text-blue-400 flex items-center gap-2 uppercase tracking-tight">
                                        <Zap size={20} /> Mercado Pago Automático
                                    </h3>
                                    <a href="https://www.mercadopago.com.ar/developers/panel/applications" target="_blank" className="text-[10px] font-black uppercase text-blue-600 hover:underline">MP Developers ↗</a>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-zinc-400 dark:text-blue-500/40 uppercase ml-4">Access Token</label>
                                        <input
                                            type="password"
                                            className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm"
                                            value={user.mpAccessToken || ''}
                                            onChange={e => setUser({ ...user, mpAccessToken: e.target.value })}
                                            placeholder="APP_USR-..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-zinc-400 dark:text-blue-500/40 uppercase ml-4">Public Key</label>
                                        <input
                                            type="text"
                                            className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm"
                                            value={user.mpPublicKey || ''}
                                            onChange={e => setUser({ ...user, mpPublicKey: e.target.value })}
                                            placeholder="APP_USR-..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="bg-primary-main text-white font-black py-5 px-14 rounded-[28px] shadow-xl shadow-primary-glow flex items-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    {saving ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Todo</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* RATINGS TAB */}
                    {activeTab === 'ratings' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                             <div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                                    <Star size={24} className="text-amber-500 fill-amber-500" /> Testimonios <ProBadge />
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Lo que tus alumnos dicen de vos.</p>
                            </div>

                            <div className="bg-zinc-50 dark:bg-bg-dark p-10 rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-inner">
                                <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
                                    <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[32px] flex items-center justify-center shadow-inner">
                                        <Star size={48} className="fill-current" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-emerald-50 mb-2 uppercase tracking-tight">Link de Calificaciones</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm leading-relaxed max-w-md">
                                            Compartí este link con tus alumnos habituales para que puedan evaluarte y dejarte feedback positivo.
                                        </p>
                                    </div>
                                    <ProFeature featureName="Gestión de Testimonios" inline>
                                        <button 
                                            onClick={handleGenerateLink}
                                            className="bg-primary-main text-white font-black px-8 py-5 rounded-[24px] flex items-center gap-2 transition hover:bg-green-600 active:scale-95 shadow-xl shadow-primary-glow uppercase tracking-widest text-[10px]"
                                        >
                                            <RefreshCw size={18} />
                                            Generar Nuevo Link
                                        </button>
                                    </ProFeature>
                                </div>

                                {ratingToken && (
                                    <div className="p-10 bg-white dark:bg-bg-soft rounded-[40px] border border-amber-500/20 shadow-sm border-dashed">
                                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-2">Link Para Alumnos</label>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-zinc-50 dark:bg-bg-dark p-5 rounded-[24px] font-mono text-xs font-bold text-primary-main truncate flex items-center border border-zinc-100 dark:border-border-emerald">
                                                {`${window.location.origin}/app/rate/${ratingToken}`}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/app/rate/${ratingToken}`);
                                                    showToast.success('Copiado');
                                                }}
                                                className="p-5 bg-primary-main/10 text-primary-main rounded-[24px] hover:bg-primary-main/20 transition-all border border-primary-main/20"
                                            >
                                                <Copy size={24} />
                                            </button>
                                        </div>
                                        <p className="mt-6 text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] text-center">
                                            Este link es válido hasta el {new Date(ratingExpires!).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <section>
                                <h3 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 mb-8 uppercase tracking-[0.2em] ml-4">Últimos Testimonios</h3>
                                {ratings.length === 0 ? (
                                    <div className="text-center py-20 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border-2 border-dashed border-zinc-100 dark:border-border-emerald">
                                        <MessageSquare size={48} className="mx-auto mb-4 text-zinc-200" />
                                        <p className="text-zinc-400 font-black uppercase tracking-tight">No hay Testimonios aún</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {ratings.map(r => (
                                            <div key={r.id} className="p-8 bg-zinc-50 dark:bg-bg-dark rounded-[40px] border border-zinc-100 dark:border-border-emerald shadow-sm group relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex gap-1 text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className={i < r.value ? 'fill-current' : 'text-zinc-200'} />
                                                        ))}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleToggleRatingVisibility(r.id)}
                                                        className={`p-2 rounded-xl transition-all ${r.showComment !== false ? 'bg-white dark:bg-bg-soft text-zinc-300' : 'bg-amber-500 text-white shadow-lg'}`}
                                                    >
                                                        {r.showComment !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                </div>
                                                <p className="text-zinc-700 dark:text-zinc-300 font-bold italic mb-6 leading-relaxed">"{r.comment}"</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-[14px] bg-primary-main/10 flex items-center justify-center text-[10px] font-black text-primary-main uppercase">
                                                        {r.studentName?.[0] || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-widest">{r.studentName || 'Anónimo'}</p>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}

                    {/* SUBSCRIPTION TAB */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                             <div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                                    <Zap size={24} className="text-amber-500" /> Mi Suscripción
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Estado y beneficios de tu plan.</p>
                            </div>

                            <div className={`p-10 rounded-[48px] border-2 shadow-inner transition-all sm:p-12 ${isPro ? 'bg-amber-400/5 border-amber-400/20' : 'bg-zinc-50 dark:bg-bg-dark border-zinc-100 dark:border-border-emerald'}`}>
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center transition-all ${isPro ? 'bg-amber-400 text-white shadow-xl shadow-amber-400/20' : 'bg-zinc-200 dark:bg-bg-soft text-zinc-400'}`}>
                                        <Zap size={48} fill={isPro ? 'currentColor' : 'none'} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-tight">
                                            {user.plan === 'PRO' ? 'Plan Pro Full Access' : (user.plan === 'INITIAL' ? 'Plan Básico (Prueba)' : 'Sin Suscripción')}
                                        </h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 justify-center md:justify-start">
                                            <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                                {user.plan === 'PRO' || user.plan === 'INITIAL' ? 'ACCESO TOTAL ILIMITADO' : 'ACCESO LIMITADO'}
                                            </p>
                                            {user.subscriptionExpiry && (
                                                <p className="text-amber-500 font-black uppercase tracking-[0.15em] text-[10px]">
                                                    {user.plan === 'INITIAL' ? 'FIN DE PRUEBA: ' : 'VENCE: '} {new Date(user.subscriptionExpiry).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => user.plan !== 'PRO' && (document.getElementById('pricing-grid')?.scrollIntoView({ behavior: 'smooth' }))}
                                        className={`px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${isPro ? 'bg-white dark:bg-bg-soft text-zinc-900 dark:text-emerald-50 shadow-md border border-zinc-100 dark:border-border-emerald hover:bg-zinc-50' : 'bg-primary-main text-white shadow-xl shadow-primary-glow hover:bg-green-600'}`}>
                                        {user.plan === 'PRO' ? 'Suscripción Activa' : (user.plan === 'INITIAL' ? 'Pasar a Pro (25% OFF)' : 'Activar Pro')}
                                    </button>
                                </div>
                            </div>

                            {priceLastUpdate && (
                                <div className="p-6 bg-zinc-500/5 dark:bg-bg-dark border border-zinc-500/10 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-emerald-500/10 text-zinc-500 flex items-center justify-center shrink-0">
                                        <HelpCircle size={24} />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
                                        Información de Precios: Los ajustes se realizan mensualmente según el 50% del IPC para acompañar la inflación cuidando a nuestra comunidad. 
                                        <span className="block mt-1 opacity-60 font-black text-[8px]">Última actualización: {new Date(priceLastUpdate).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
                                    </p>
                                </div>
                            )}

                            {/* Aviso de Próximo Aumento (10 días antes) */}
                            {pendingAdjustment && !pendingAdjustment.applied && (() => {
                                const activationDate = new Date(pendingAdjustment.activationDate);
                                const today = new Date();
                                const daysUntilActivation = Math.ceil((activationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                
                                if (daysUntilActivation <= 10 && daysUntilActivation >= 0) {
                                    return (
                                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-center gap-4 animate-pulse">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                                <Zap size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-1">Próximo Ajuste Programado</h5>
                                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                                                    Debido a la inflación, los precios se ajustarán un <span className="p-1 bg-amber-500 text-white rounded-md mx-1">+{pendingAdjustment.percent.toFixed(1)}%</span> 
                                                    a partir del {activationDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {(() => {
                                const basicPlan = subscriptionPlans.find(p => p.id === 'basic-monthly');
                                const basicPrice = basicPlan?.price || 5242;
                                const basicOriginalFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Math.round(basicPrice / 0.75));

                                const proMonthlyPlan = subscriptionPlans.find(p => p.id === 'pro-monthly');
                                const proMonthlyPrice = proMonthlyPlan?.price || 11242;
                                const proMonthlyOriginalFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Math.round(proMonthlyPrice / 0.75));

                                const proTrimestralPlan = subscriptionPlans.find(p => p.id === 'pro-trimestral');
                                const proTrimestralPrice = proTrimestralPlan?.price || 30352;
                                const proTrimestralOriginalFormatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Math.round(proTrimestralPrice / 0.75));

                                return (
                                <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                <div className="p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald flex flex-col justify-between relative overflow-hidden">
                                     <motion.div
                                         animate={{ scale: [1, 1.05, 1] }}
                                         transition={{ repeat: Infinity, duration: 2 }}
                                         className="absolute top-4 right-4 bg-emerald-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(22,163,74,0.3)]"
                                     >
                                         25% OFF
                                     </motion.div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-[0.2em] mb-8">Plan Básico</h4>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <p className="text-4xl font-black text-zinc-900 dark:text-emerald-50 tracking-tighter uppercase">
                                                {basicPlan?.priceFormatted || '$5.242'}
                                            </p>
                                            <span className="text-sm text-zinc-400 line-through decoration-red-500/40 font-bold mb-1">
                                                {basicOriginalFormatted}
                                            </span>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">/ mes</span>
                                        </div>
                                        <p className="text-[10px] font-black text-primary-main uppercase tracking-widest mb-6">Prueba de 14 días</p>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                                <Zap size={12} className="fill-current text-primary-main/40" /> Acceso total a herramientas
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                                <Zap size={12} className="fill-current text-primary-main/40" /> Gestión de alumnos y pagos
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                                <Zap size={12} className="fill-current text-primary-main/40" /> Recordatorios automáticos
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center py-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">Incluido al registrarse</span>
                                    </div>
                                </div>

                                <div className="p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border-2 border-emerald-500/20 flex flex-col justify-between relative overflow-hidden shadow-[0_0_20px_rgba(22,163,74,0.05)]">
                                     <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                                    >
                                        25% OFF
                                    </motion.div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Plan Pro</h4>
                                        
                                        {/* Frequency Toggle */}
                                        <div className="flex bg-white dark:bg-bg-soft p-1 rounded-xl mb-6 border border-zinc-100 dark:border-border-emerald">
                                            <button
                                                onClick={() => setIsTrimestral(false)}
                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${!isTrimestral ? 'bg-primary-main text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                                            >
                                                Mensual
                                            </button>
                                            <button
                                                onClick={() => setIsTrimestral(true)}
                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${isTrimestral ? 'bg-primary-main text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
                                            >
                                                Trimestral
                                            </button>
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-1">
                                            <p className="text-4xl font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-tighter">
                                                {isTrimestral 
                                                    ? (proTrimestralPlan?.priceFormatted || '$30.352')
                                                    : (proMonthlyPlan?.priceFormatted || '$11.242')}
                                            </p>
                                            <span className="text-sm text-zinc-400 line-through decoration-red-500/40 font-bold">
                                                {isTrimestral ? proTrimestralOriginalFormatted : proMonthlyOriginalFormatted}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">
                                            {isTrimestral ? 'Pago único trimestral' : 'Facturación mensual'}
                                        </p>

                                        <div className="space-y-3 mb-8">
                                            {[
                                                'Alumnos ilimitados',
                                                'Dashboard PRO & Gráficos',
                                                'Sincronización Google Calendar',
                                                'Mensajes para WhatsApp automatizados',
                                                'Integración experta Mercado Pago',
                                                'Reportes financieros & Recibos',
                                                'Perfil destacado en la página'
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-3 text-[10px] font-black text-zinc-700 dark:text-white uppercase tracking-widest leading-none bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-all hover:scale-[1.02]">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                        <Zap size={10} className="fill-current text-primary-main" />
                                                    </div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleUpgrade(isTrimestral ? 'PRO_TRIMESTRAL' : 'PRO_MONTHLY')}
                                        disabled={loadingCheckout !== null}
                                        className="w-full py-4 text-xs font-black uppercase tracking-widest bg-primary-main text-white rounded-2xl shadow-lg shadow-primary-glow hover:bg-green-600 transition-all flex justify-center items-center gap-2">
                                        {loadingCheckout ? <RefreshCw size={16} className="animate-spin" /> : (isTrimestral ? 'Pagar PRO Trimestral' : 'Pagar PRO Mensual')}
                                    </button>
                                </div>
                                </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                             <div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                                    <Shield size={24} className="text-primary-main" /> Seguridad
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Protegé tu cuenta y privacidad.</p>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-8 p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald shadow-inner">
                                <h3 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-8 ml-4 tracking-widest">Cambio de Contraseña</h3>
                                <div className="space-y-6">
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm pr-14"
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
                                                type={showNewPassword ? "text" : "password"}
                                                className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm pr-14"
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
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm pr-14"
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
                                        className="bg-primary-main text-white font-black py-4 px-12 rounded-[24px] shadow-lg shadow-primary-glow flex items-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        {changingPassword ? <RefreshCw className="animate-spin" /> : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                            </form>

                            <div className="p-10 bg-red-500/5 rounded-[48px] border border-red-500/10">
                                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Zona Crítica</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold mb-6">Si eliminas tu cuenta, perderás todos tus datos permanentemente.</p>
                                <button className="px-8 py-4 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                                    Eliminar Mi Cuenta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <SupportModal 
                isOpen={isSupportOpen} 
                onClose={() => setIsSupportOpen(false)} 
                onSent={() => showToast.success('Mensaje enviado')} 
            />
            <LegalModal 
                isOpen={legalModal.isOpen} 
                type={legalModal.type} 
                onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
            />
        </Layout>
    );
};

export default Settings;
