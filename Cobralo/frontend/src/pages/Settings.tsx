import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { User } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    User as UserIcon, Shield, CreditCard, Building2,
    MessageSquare, Star, Zap, HelpCircle, FileText,
    ChevronLeft
} from 'lucide-react';
import SupportModal from '../components/SupportModal';
import LegalModal from '../components/LegalModal';
import { showToast } from '../components/Toast';
import { SPRING_PHYSICS } from '../utils/motion';

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
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'academy' | 'automation' | 'subscription' | 'ratings'>('profile');
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' }>({ isOpen: false, type: 'terms' });
    
    // Mobile toggle logic
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
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
        mpAccessToken: '', mpPublicKey: '', notificationsEnabled: true, isPublicProfileVisible: true,
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
    const [studentCount, setStudentCount] = useState(0);
    const [scheduleCount, setScheduleCount] = useState(0);
    const [hasRecentPayments, setHasRecentPayments] = useState(false);

    const categories: Category[] = [
        { id: 'general', label: 'Mi Perfil', icon: UserIcon, tabs: [
            { id: 'profile', label: 'Datos Personales', icon: UserIcon, description: 'Información básica de tu cuenta.' },
            { id: 'security', label: 'Seguridad', icon: Shield, description: 'Actualizá tu contraseña y protegé tu cuenta.' }
        ]},
        { id: 'academy', label: 'Mi Academia', icon: Building2, tabs: [
            { id: 'academy', label: 'Servicios y Marca', icon: Zap, description: 'Gestioná tu academia y perfil público.' },
            { id: 'ratings', label: 'Testimonios', icon: Star, description: 'Lo que tus alumnos dicen de vos.' }
        ]},
        { id: 'automation', label: 'Automatización', icon: MessageSquare, tabs: [
            { id: 'automation', label: 'Pagos y Mensajes', icon: CreditCard, description: 'Automatizá tus cobros y recordatorios.' }
        ]},
        { id: 'subscription', label: 'Mi Suscripción', icon: CreditCard, tabs: [
            { id: 'subscription', label: 'Plan Actual', icon: Zap, description: 'Gestioná tu plan y facturación.' }
        ]},
        { id: 'support', label: 'Ayuda', icon: HelpCircle, tabs: [
            { id: 'support-trigger', label: 'Soporte Técnico', icon: HelpCircle, isAction: true, onClick: () => setIsSupportOpen(true), description: 'Contactá con nuestro equipo.' },
            { id: 'terms-trigger', label: 'Legales', icon: FileText, isAction: true, onClick: () => setLegalModal({ isOpen: true, type: 'terms' }), description: 'Términos y condiciones.' }
        ]},
    ];

    const getAllTabs = () => categories.flatMap(c => c.tabs);
    const activeTabInfo = getAllTabs().find(t => t.id === activeTab);
    const tab = activeTabInfo || { label: 'Ajustes', description: 'Personalizá tu experiencia.' };

    useEffect(() => {
        const hasParam = searchParams.get('checkout') || searchParams.get('tab');
        if (hasParam && window.innerWidth < 1024) setIsNavOpen(false);
    }, [searchParams]);

    useEffect(() => {
        fetchProfile();
        fetchUserServices();
        fetchRatings();
        fetchSubscriptionPlans();
        fetchMetrics();
    }, []);

    const autoCheckoutDone = React.useRef(false);
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

    const fetchUserServices = async () => {
        try { setUserServices(await api.getServices()); } catch (e) { console.error(e); }
    };

    const handleAddService = async () => {
        if (!newService.name || !newService.defaultPrice) return;
        try {
            const added = await api.createService({ name: newService.name, defaultPrice: Number(newService.defaultPrice) });
            setUserServices([...userServices, added]);
            setNewService({ name: '', defaultPrice: '' });
            showToast.success('Servicio agregado');
        } catch { showToast.error('Error al agregar servicio'); }
    };

    const handleDeleteService = async (id: number) => {
        try {
            await api.deleteService(id);
            setUserServices(userServices.filter(s => s.id !== id));
            showToast.success('Servicio eliminado');
        } catch { showToast.error('Error al eliminar servicio'); }
    };

    const fetchProfile = async () => {
        try {
            const data = await api.getProfile();
            setUser({ ...data, notificationsEnabled: data.notificationsEnabled ?? true, isPublicProfileVisible: data.isPublicProfileVisible ?? true });
            setRatingToken(data.ratingToken || null);
            setRatingExpires(data.ratingTokenExpires || null);
        } catch { showToast.error('Error al cargar perfil'); }
        finally { setLoading(false); }
    };

    const handleToggleRatingVisibility = async (id: number) => {
        try {
            await api.toggleRatingComment(id);
            setRatings(ratings.map(r => r.id === id ? { ...r, showComment: !r.showComment } : r));
            showToast.success('Visibilidad actualizada');
        } catch { showToast.error('Error al actualizar visibilidad'); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await api.updateProfile(user);
            showToast.success('¡Configuración guardada!');
            updateAuthUser(updated);
        } catch { showToast.error('Error al guardar cambios'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) { showToast.error('Las contraseñas no coinciden'); return; }
        setChangingPassword(true);
        try {
            await api.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
            showToast.success('Contraseña actualizada correctamente');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) { showToast.error(error.message || 'Error al cambiar contraseña'); }
        finally { setChangingPassword(false); }
    };

    const handleUpgrade = async (planId: string) => {
        try {
            setLoadingCheckout(planId);
            const { checkoutUrl } = await api.createCheckoutSession(planId);
            if (checkoutUrl) window.location.href = checkoutUrl;
            else showToast.error('Error al iniciar pago');
        } catch { showToast.error('Error al generar el link de pago'); }
        finally { setLoadingCheckout(null); }
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
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start relative min-h-[calc(100vh-200px)]">

                {/* SIDEBAR BLOCK - ISOLATED FLEX */}
                <div 
                    className={`transition-all duration-500 ease-in-out shrink-0 ${
                        isNavOpen ? 'block' : 'hidden lg:block'
                    } ${
                        isCollapsed ? 'lg:w-[100px]' : 'lg:w-[320px] xl:w-[380px]'
                    }`}
                >
                    <div className="lg:sticky lg:top-24 w-full">
                        <SettingsNav
                            categories={categories}
                            activeTab={activeTab}
                            isCollapsed={isCollapsed}
                            setIsCollapsed={setIsCollapsed}
                            setActiveTab={id => { setActiveTab(id); if(window.innerWidth < 1024) setIsNavOpen(false); }}
                            setIsNavOpen={setIsNavOpen}
                        />
                    </div>
                </div>

                {/* CONTENT BLOCK - ISOLATED FLEX */}
                <div className={`flex-1 w-full min-w-0 ${isNavOpen ? 'hidden lg:block' : 'block'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + (isNavOpen ? 'nav' : 'content')}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={SPRING_PHYSICS}
                            className="bg-white dark:bg-bg-dark/40 rounded-[32px] lg:rounded-[40px] p-4 md:p-8 lg:p-12 shadow-inner-white dark:shadow-none border border-zinc-100 dark:border-emerald-500/10 min-h-0 lg:min-h-[600px] w-full overflow-hidden"
                        >
                            {/* Mobile back header */}
                            <div className="lg:hidden flex items-center justify-between mb-10 pb-6 border-b border-zinc-100 dark:border-white/5">
                                <button onClick={() => setIsNavOpen(true)} className="group flex items-center gap-4 text-primary-main font-black uppercase tracking-widest text-[14px]">
                                    <div className="w-10 h-10 rounded-full bg-primary-main/10 dark:bg-emerald-500/10 flex items-center justify-center group-active:scale-90 transition-all border border-transparent group-hover:border-primary-main/20 shadow-sm">
                                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                                    </div>
                                    <span>Ajustes</span>
                                </button>
                                <div className="px-4 py-2 rounded-full bg-zinc-50 dark:bg-bg-dark border border-zinc-100 dark:border-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-tighter shadow-sm">
                                    {categories.find(c => c.tabs.some(t => t.id === activeTab))?.label}
                                </div>
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
                                isPro={isPro} pendingAdjustment={pendingAdjustment} setLegalModal={setLegalModal}
                                studentCount={studentCount} scheduleCount={scheduleCount} hasRecentPayments={hasRecentPayments}
                                subscriptionPlans={subscriptionPlans} priceLastUpdate={priceLastUpdate}
                                loadingCheckout={loadingCheckout} handleUpgrade={handleUpgrade}
                                ratings={ratings} ratingToken={ratingToken} ratingExpires={ratingExpires}
                                handleGenerateLink={handleGenerateLink} handleToggleRatingVisibility={handleToggleRatingVisibility}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} onSent={() => showToast.success('Mensaje enviado')} />
            <LegalModal isOpen={legalModal.isOpen} type={legalModal.type} onClose={() => setLegalModal({ ...legalModal, isOpen: false })} />
        </Layout>
    );
};

export default Settings;
