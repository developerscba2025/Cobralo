import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    User as UserIcon, CreditCard, Building2,
    MessageSquare, Star, Zap, HelpCircle, FileText,
    ChevronLeft,
    Check,
    RotateCcw,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../components/Toast';

// Settings sub-components
import SettingsNav from '../components/settings/SettingsNav';
import SettingsContent from '../components/settings/SettingsContent';

interface Tab {
    id: string;
    label: string;
    icon: any;
    description?: string;
    isAction?: boolean;
    onClick?: () => void;
}

interface Category {
    id: string;
    label: string;
    icon: any;
    tabs: Tab[];
}

const Settings = () => {
    const { updateUser: updateAuthUser, isPro } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'security' | 'academy' | 'services' | 'automation' | 'subscription' | 'ratings' | 'support' | 'legal' | 'payment-accounts'>('account');

    // Mobile toggle logic
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [searchParams] = useSearchParams();

    // Form state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Data state
    const [user, setUser] = useState<Partial<User>>({
        name: '', email: '', bizName: '', businessCategory: '', phoneNumber: '', taxId: '',
        billingAddress: '', bizAlias: '', reminderTemplate: 'Hola {alumno}! Te escribo de {negocio} para recordarte tu clase de {servicio}. El monto es de ${monto}. Saludos!',
        defaultPrice: 0, defaultService: 'General', defaultSurcharge: 10, currency: '$', receiptFooter: '',
        mpAccessToken: '', mpPublicKey: '', notificationsEnabled: true, classRemindersEnabled: false, classReminderMinutes: 120, isPublicProfileVisible: true,
        biography: '', photoUrl: '', instagramUrl: '', facebookUrl: ''
    });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [userServices, setUserServices] = useState<any[]>([]);
    const [newService, setNewService] = useState({ name: '', defaultPrice: '' });
    const [ratings, setRatings] = useState<any[]>([]);
    const [ratingToken, setRatingToken] = useState<string | null>(null);
    const [ratingExpires, setRatingExpires] = useState<string | null>(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
    const [priceLastUpdate, setPriceLastUpdate] = useState<string | null>(null);
    const [pendingAdjustment, setPendingAdjustment] = useState<any>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
    const [cancelingSubscription, setCancelingSubscription] = useState(false);
    const [studentCount, setStudentCount] = useState(0);
    const [scheduleCount, setScheduleCount] = useState(0);
    const [hasRecentPayments, setHasRecentPayments] = useState(false);
    const [originalUser, setOriginalUser] = useState<Partial<User>>({});

    const isDirty = JSON.stringify(user) !== JSON.stringify(originalUser);

    const categories: Category[] = [
        { id: 'cuenta', label: 'Cuenta', icon: UserIcon, tabs: [
            { id: 'account', label: 'Mi Cuenta', icon: UserIcon, description: 'Datos personales y seguridad' },
        ]},
        { id: 'plan', label: 'Mi Plan', icon: Zap, tabs: [
            { id: 'subscription', label: 'Plan y Suscripción', icon: Zap, description: isPro ? 'Activo — Plan PRO' : 'Mejorá tu cuenta' },
        ]},
        { id: 'negocio', label: 'Negocio', icon: Building2, tabs: [
            { id: 'academy', label: 'Perfil Público', icon: Building2, description: 'Tu página web y logo' },
            { id: 'services', label: 'Servicios', icon: Star, description: 'Clases y precios' },
            { id: 'payment-accounts', label: 'Medios de Pago', icon: CreditCard, description: 'Alias / CBU para cobrar' },
            { id: 'automation', label: 'Automatización', icon: MessageSquare, description: 'Avisos por WhatsApp' },
            { id: 'ratings', label: 'Testimonios', icon: MessageSquare, description: 'Reseñas de alumnos' }
        ]},
        { id: 'ayuda', label: 'Ayuda', icon: HelpCircle, tabs: [
            { id: 'support', label: 'Soporte', icon: HelpCircle, description: 'Escribinos tu consulta' },
            { id: 'legal', label: 'Legales', icon: FileText, description: 'Términos de uso' }
        ]},
    ];

    const getAllTabs = () => categories.flatMap(c => c.tabs);
    const activeTabInfo = getAllTabs().find(t => t.id === activeTab);
    const tab = activeTabInfo || { label: 'Ajustes', description: 'Personalizá tu experiencia.' };

    useEffect(() => {
        const tabParam = searchParams.get('tab');
        const hasParam = searchParams.get('checkout') || tabParam;
        if (tabParam) setActiveTab(tabParam as any);
        if (hasParam && window.innerWidth < 1024) setIsNavOpen(false);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [u, services] = await Promise.all([api.getProfile(), api.getServices()]);
                setUser(u);
                setOriginalUser(u);
                setUserServices(services);
            } catch { } finally { setLoading(false); }
        };
        load();
        fetchMetrics();
        fetchSubscriptionPlans();
        fetchRatings();
        fetchSubscriptionInfo();
    }, []);

    const autoCheckoutDone = useRef(false);
    useEffect(() => {
        const checkoutPlan = searchParams.get('checkout');
        if (checkoutPlan && !loading && !autoCheckoutDone.current) {
            autoCheckoutDone.current = true;
            setActiveTab('subscription');
            handleUpgrade(checkoutPlan);
        }
    }, [loading]);

    const fetchMetrics = async () => {
        try {
            const [students, schedules, payments] = await Promise.all([api.getStudents(), api.getSchedules(), api.getPayments()]);
            setStudentCount(students.length);
            setScheduleCount(schedules.length);
            const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            setHasRecentPayments(payments.some(p => new Date(p.paidAt) >= thirtyDaysAgo));
        } catch (e) { console.error(e); }
    };

    const fetchSubscriptionPlans = async () => {
        try {
            const data = await api.getSubscriptionPlans?.() || { plans: [], pendingAdjustment: null };
            setSubscriptionPlans(data.plans || []);
            setPriceLastUpdate(data.lastUpdate);
            setPendingAdjustment(data.pendingAdjustment);
        } catch (e) { console.error(e); }
    };

    const fetchSubscriptionInfo = async () => {
        try {
            const subs = await api.getSubscriptionHistory();
            if (subs && subs.length > 0) {
                setSubscriptionStatus(subs[0].status);
            }
        } catch (e) { console.error(e); }
    };

    const fetchRatings = async () => {
        try { setRatings(await api.getMyRatings()); } catch (e) { console.error(e); }
    };

    const handleGenerateLink = async () => {
        try {
            const data = await api.generateRatingLink();
            setRatingToken(data.token); setRatingExpires(data.expires);
            showToast.success('¡Link generado con éxito!');
        } catch { showToast.error('Error al generar el link'); }
    };

    const handleToggleRatingVisibility = async (ratingId: number) => {
        try {
            await api.toggleRatingComment(ratingId);
            setRatings(prev => prev.map(r => r.id === ratingId ? { ...r, isVisible: !r.isVisible } : r));
        } catch { showToast.error('Error al actualizar testimonio'); }
    };

    const [autoSaveEnabled, setAutoSaveEnabled] = useState(localStorage.getItem('cobralo_autosave') === 'true');

    useEffect(() => {
        if (!autoSaveEnabled || loading) return;
        const timer = setTimeout(() => {
            handleSave(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, [user, autoSaveEnabled]);

    const toggleAutoSave = () => {
        const newValue = !autoSaveEnabled;
        setAutoSaveEnabled(newValue);
        localStorage.setItem('cobralo_autosave', String(newValue));
        if (newValue) {
            showToast.success('Auto-guardado activado');
            handleSave(true);
        } else {
            showToast.success('Auto-guardado desactivado');
        }
    };

    const handleSave = async (isAuto = false) => {
        try {
            if (!isAuto) setSaving(true);
            const updated = await api.updateProfile(user);
            setUser(updated);
            setOriginalUser(updated);
            updateAuthUser(updated);
            if (!isAuto) showToast.success('¡Cambios guardados!');
        } catch (err: any) {
            if (!isAuto) showToast.error(err.message || 'Error al guardar');
        } finally {
            if (!isAuto) setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast.error('Las contraseñas no coinciden'); return;
        }
        try {
            setChangingPassword(true);
            await api.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
            showToast.success('Contraseña actualizada');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            showToast.error(err.message || 'Error al cambiar contraseña');
        } finally { setChangingPassword(false); }
    };

    const handleUpgrade = async (planId: string) => {
        try {
            setLoadingCheckout(planId);
            const { checkoutUrl } = await api.createCheckoutSession(planId);
            window.location.href = checkoutUrl;
        } catch (err: any) {
            showToast.error(err.message || 'Error al procesar el pago');
        } finally { setLoadingCheckout(null); }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('¿Seguro que querés dar de baja tu suscripción PRO? Seguirás teniendo acceso hasta el final del periodo pagado.')) {
            return;
        }
        try {
            setCancelingSubscription(true);
            await api.cancelSubscription();
            showToast.success('Suscripción dada de baja. Conservarás los beneficios hasta el final del periodo.');
            setSubscriptionStatus('CANCEL_AT_PERIOD_END');
        } catch (err: any) {
            showToast.error(err.message || 'Error al cancelar la suscripción');
        } finally {
            setCancelingSubscription(false);
        }
    };

    const handleAddService = async () => {
        if (!newService.name) return;
        try {
            const created = await api.createService({ name: newService.name, defaultPrice: parseFloat(newService.defaultPrice) || 0 });
            setUserServices(prev => [...prev, created]);
            setNewService({ name: '', defaultPrice: '' });
            showToast.success('Servicio creado');
        } catch { showToast.error('Error al crear el servicio'); }
    };

    const handleUpdateService = async (id: number, data: any) => {
        try {
            const updated = await api.updateService(id, data);
            setUserServices(prev => prev.map(s => s.id === id ? updated : s));
            showToast.success(data.updateStudents ? 'Servicio y alumnos actualizados' : 'Servicio actualizado');
        } catch { showToast.error('Error al actualizar'); }
    }

    const handleDeleteService = async (id: number) => {
        try {
            await api.deleteService(id);
            setUserServices(prev => prev.filter(s => s.id !== id));
        } catch { showToast.error('Error al eliminar'); }
    };

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main" />
            </div>
        </Layout>
    );

    return (
        <Layout>
            {/* ═══ UNIFIED CONTAINER ═══ */}
            <div className="bg-surface rounded-[32px] min-h-[calc(100vh-200px)] lg:h-[calc(100vh-80px)] lg:min-h-0 overflow-hidden border border-border-main shadow-xl">
                <div className="flex flex-col lg:flex-row h-full">

                    {/* ── SIDEBAR (Accordion Nav) ── */}
                    <div className={`shrink-0 transition-all duration-500 ease-in-out lg:h-full lg:overflow-y-auto hide-scrollbar border-b lg:border-b-0 lg:border-r border-border-main lg:w-[30%] xl:w-[25%] min-w-[260px] max-w-[400px] ${
                        isNavOpen ? 'block' : 'hidden lg:block'
                    }`}>
                        <div className="w-full p-4 md:p-6 lg:p-8 min-h-full">
                            <SettingsNav
                                categories={categories}
                                activeTab={activeTab}
                                setActiveTab={id => { setActiveTab(id); if (window.innerWidth < 1024) setIsNavOpen(false); }}
                                setIsNavOpen={setIsNavOpen}
                                isPro={isPro}
                            />
                        </div>
                    </div>

                    {/* ── CONTENT ── */}
                    <div className={`flex-1 min-w-0 lg:h-full lg:overflow-y-auto hide-scrollbar ${isNavOpen ? 'hidden lg:block' : 'block'}`}>
                        <div className="p-4 md:p-6 lg:p-8 xl:p-10 min-h-full">

                            {/* Desktop Header */}
                            <div className="hidden lg:block mb-10 space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
                                <h2 className="text-4xl xl:text-5xl font-black text-text-main tracking-tighter uppercase italic">
                                    {tab.label}
                                </h2>
                                <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                                    {tab.description}
                                </p>
                            </div>

                            {/* Mobile back header */}
                            <div className="lg:hidden flex items-center justify-between mb-10 pb-6 border-b border-border-main">
                                <button onClick={() => setIsNavOpen(true)} className="group flex items-center gap-4 text-primary-main font-black uppercase tracking-widest text-[14px] touch-target">
                                    <div className="w-10 h-10 rounded-full bg-primary-main/10 dark:bg-emerald-500/10 flex items-center justify-center group-active:scale-90 transition-all">
                                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                                    </div>
                                    <span>Ajustes</span>
                                </button>
                                <label className="flex items-center gap-2 cursor-pointer group px-4 py-2 rounded-full bg-bg-app border border-border-main">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Auto-Guardar</span>
                                    <div className={`relative w-8 h-4 rounded-full transition-colors ${autoSaveEnabled ? 'bg-primary-main' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                                        <div className={`absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full transition-transform ${autoSaveEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <input type="checkbox" checked={autoSaveEnabled} onChange={toggleAutoSave} className="sr-only" />
                                </label>
                            </div>

                            {/* Desktop Auto-save Toggle */}
                            <div className="hidden lg:flex items-center justify-end mb-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-primary-main transition-colors">Guardado Automático</span>
                                    <div className={`relative w-10 h-5 rounded-full transition-colors ${autoSaveEnabled ? 'bg-primary-main' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <input type="checkbox" checked={autoSaveEnabled} onChange={toggleAutoSave} className="sr-only" />
                                </label>
                            </div>

                            <SettingsContent
                                activeTab={activeTab}
                                user={user} setUser={setUser} handleSave={handleSave} saving={saving} tab={tab}
                                passwordData={passwordData} setPasswordData={setPasswordData}
                                handleChangePassword={handleChangePassword} changingPassword={changingPassword}
                                showCurrentPassword={showCurrentPassword} setShowCurrentPassword={setShowCurrentPassword}
                                showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword}
                                showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
                                userServices={userServices} newService={newService} setNewService={setNewService}
                                handleAddService={handleAddService} handleDeleteService={handleDeleteService}
                                isPro={isPro} pendingAdjustment={pendingAdjustment} setActiveTab={setActiveTab}
                                studentCount={studentCount} scheduleCount={scheduleCount} hasRecentPayments={hasRecentPayments}
                                subscriptionPlans={subscriptionPlans} priceLastUpdate={priceLastUpdate}
                                loadingCheckout={loadingCheckout} handleUpgrade={handleUpgrade}
                                handleCancelSubscription={handleCancelSubscription}
                                cancelingSubscription={cancelingSubscription}
                                subscriptionStatus={subscriptionStatus}
                                ratings={ratings} ratingToken={ratingToken} ratingExpires={ratingExpires}
                                handleGenerateLink={handleGenerateLink} handleToggleRatingVisibility={handleToggleRatingVisibility}
                                handleUpdateService={handleUpdateService}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* ── FLOATING SAVE BAR ── */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-2xl"
                    >
                        <div className="bg-zinc-900 dark:bg-zinc-800 border border-white/10 shadow-2xl rounded-[32px] p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-main/20 flex items-center justify-center text-primary-main">
                                    <RotateCcw size={24} className="animate-pulse" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-white font-black text-sm uppercase tracking-tight">Cambios pendientes</h4>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">¿Deseás guardar la nueva configuración?</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => setUser(originalUser)}
                                    className="flex-1 sm:flex-none px-6 py-3 text-zinc-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                                >
                                    Descartar
                                </button>
                                <button 
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-primary-main text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-glow flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {saving ? <RefreshCw className="animate-spin" size={14} /> : <><Check size={14} /> Guardar Cambios</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </Layout>
    );
};

export default Settings;
