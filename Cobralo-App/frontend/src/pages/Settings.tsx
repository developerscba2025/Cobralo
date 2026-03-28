import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    Copy,
    Eye,
    EyeOff,
    HelpCircle,
    FileText
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
    
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [legalModal, setLegalModal] = useState<{ isOpen: boolean, type: 'terms' | 'privacy' }>({ isOpen: false, type: 'terms' });
    const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

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
    
    const categories = [
        { 
            id: 'general', 
            label: 'Mi Perfil', 
            icon: UserIcon, 
            tabs: [
                { id: 'profile', label: 'Datos Personales', icon: UserIcon },
                { id: 'security', label: 'Seguridad', icon: Shield }
            ] 
        },
        { 
            id: 'academy', 
            label: 'Mi Academia', 
            icon: Building2, 
            tabs: [
                { id: 'academy', label: 'Servicios y Marca', icon: Zap },
                { id: 'ratings', label: 'Testimonios', icon: Star }
            ] 
        },
        { 
            id: 'automation', 
            label: 'Automatización', 
            icon: MessageSquare, 
            tabs: [
                { id: 'automation', label: 'Pagos y Mensajes', icon: CreditCard }
            ] 
        },
        { 
            id: 'subscription', 
            label: 'Mi Suscripción', 
            icon: CreditCard,
            tabs: [
                { id: 'subscription', label: 'Plan Actual', icon: Zap }
            ]
        },
        { 
            id: 'support', 
            label: 'Ayuda', 
            icon: HelpCircle, 
            tabs: [
                { id: 'support-trigger', label: 'Soporte Técnico', icon: HelpCircle, isAction: true, onClick: () => setIsSupportOpen(true) },
                { id: 'terms-trigger', label: 'Legales', icon: FileText, isAction: true, onClick: () => setLegalModal({ isOpen: true, type: 'terms' }) }
            ] 
        }
    ];

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [user, setUser] = useState<Partial<User>>({
        name: '', email: '', bizName: '', businessCategory: '', phoneNumber: '', taxId: '', billingAddress: '', bizAlias: '', reminderTemplate: 'Hola {alumno}! Te escribo de {negocio} para recordarte tu clase de {servicio}. El monto es de ${monto}. Saludos!',
        defaultPrice: 0, defaultService: 'General', defaultSurcharge: 10, currency: '$', receiptFooter: '',
        mpAccessToken: '', mpPublicKey: '', notificationsEnabled: true, isPublicProfileVisible: true
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

    useEffect(() => {
        fetchProfile();
        fetchUserServices();
        fetchRatings();
    }, []);

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
                <h1 className="text-3xl font-black text-zinc-900 dark:text-emerald-50 tracking-tight leading-none mb-2 uppercase">Configuración</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg tracking-tight">Personalizá tu experiencia y gestioná tu academia.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    {categories.map(cat => (
                        <div key={cat.id} className="space-y-3">
                            <h3 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-[0.2em] ml-4 mb-2">
                                {cat.label}
                            </h3>
                            <div className="flex flex-col gap-1">
                                {cat.tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if ((tab as any).isAction) {
                                                (tab as any).onClick();
                                            } else {
                                                setActiveTab(tab.id as any);
                                            }
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${
                                            activeTab === tab.id
                                                ? 'bg-primary-main text-white shadow-lg shadow-primary-glow dark:shadow-none translate-x-1'
                                                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-bg-soft hover:text-zinc-800 dark:hover:text-emerald-50'
                                        }`}
                                    >
                                        <tab.icon size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-50'} />
                                        {tab.label}
                                        {(tab as any).isAction && <ExternalLink size={12} className="ml-auto opacity-30" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 bg-white dark:bg-bg-soft rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 dark:border-border-emerald min-h-[600px] animate-in fade-in slide-in-from-right-4 duration-700">
                    
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                                    <UserIcon size={24} className="text-primary-main" /> Datos Personales
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Información básica de tu cuenta.</p>
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
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Preferencias Visuales</label>
                                    <div className="flex gap-4 p-2 bg-white dark:bg-bg-soft rounded-[32px] shadow-sm">
                                        {(['light', 'dark'] as const).map(t => (
                                            <button 
                                                key={t}
                                                type="button"
                                                onClick={() => setTheme(t)}
                                                className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${theme === t ? 'bg-primary-main text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-white'}`}
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
                                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-2 ml-4 tracking-widest">Categoría / Especialidad</label>
                                    <input
                                        type="text"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm focus:ring-2 focus:ring-primary-main/20 outline-none"
                                        value={user.businessCategory}
                                        onChange={e => setUser({ ...user, businessCategory: e.target.value })}
                                        placeholder="Ej: Fitness, Música..."
                                    />
                                </div>
                                <div className="md:col-span-2 p-8 bg-white dark:bg-bg-soft rounded-[32px] shadow-sm border border-zinc-100 dark:border-border-emerald">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Servicios Ofrecidos</h3>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Nuevo servicio..." 
                                                className="bg-zinc-50 dark:bg-bg-dark p-2 px-4 rounded-xl text-xs font-bold border-none"
                                                value={newService.name}
                                                onChange={e => setNewService({...newService, name: e.target.value})}
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="Precio" 
                                                className="bg-zinc-50 dark:bg-bg-dark p-2 px-4 rounded-xl text-xs font-bold border-none w-20"
                                                value={newService.defaultPrice}
                                                onChange={e => setNewService({...newService, defaultPrice: e.target.value})}
                                            />
                                            <button onClick={handleAddService} className="bg-primary-main text-white p-2 rounded-xl hover:bg-green-600 transition-all">
                                                <Zap size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {userServices.map(service => (
                                            <div key={service.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-bg-dark rounded-[20px] group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-main/10 flex items-center justify-center text-primary-main">
                                                        <Zap size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-800 dark:text-emerald-50 text-sm">{service.name}</p>
                                                        <p className="text-[10px] font-black text-primary-main uppercase tracking-widest">{user.currency}{service.defaultPrice}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteService(service.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
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
                                            <p className="text-xs font-bold text-primary-main/60 tracking-tight">cobraloapp.com/profile/{user.bizAlias || user.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://cobraloapp.com/profile/${user.bizAlias || user.id}`);
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
                                        {['{alumno}', '{monto}', '{negocio}', '{servicio}', '{link}'].map(tag => (
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
                                                {`${window.location.origin}/rate/${ratingToken}`}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/rate/${ratingToken}`);
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

                            <div className={`p-10 rounded-[48px] border-2 shadow-inner transition-all ${isPro ? 'bg-amber-400/5 border-amber-400/20' : 'bg-zinc-50 dark:bg-bg-dark border-zinc-100 dark:border-border-emerald'}`}>
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center transition-all ${isPro ? 'bg-amber-400 text-white shadow-xl shadow-amber-400/20' : 'bg-zinc-200 dark:bg-bg-soft text-zinc-400'}`}>
                                        <Zap size={48} fill={isPro ? 'currentColor' : 'none'} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-tight">
                                            Plan {user.plan?.toUpperCase() || 'GRATUITO'}
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                                            {isPro ? 'ACCESSO TOTAL HABILITADO' : 'LIMITADO A 5 ALUMNOS'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => showToast.success('Tu plan está activo')}
                                        className={`px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${isPro ? 'bg-white dark:bg-bg-soft text-zinc-900 dark:text-emerald-50 shadow-md border border-zinc-100 dark:border-border-emerald hover:bg-zinc-50' : 'bg-primary-main text-white shadow-xl shadow-primary-glow hover:bg-green-600'}`}>
                                        {isPro ? 'Administrar' : 'Pasar a Pro'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Plan Mensual</h4>
                                        <p className="text-3xl font-black text-zinc-900 dark:text-emerald-50 mb-1">$6.749</p>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">PROMO LANZAMIENTO (25% OFF)</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUpgrade('PRO_MONTHLY')}
                                        disabled={loadingCheckout !== null}
                                        className="w-full py-4 text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex justify-center items-center gap-2">
                                        {loadingCheckout === 'PRO_MONTHLY' ? <RefreshCw size={16} className="animate-spin" /> : 'Pagar Mensual'}
                                    </button>
                                </div>
                                <div className="p-10 bg-zinc-50 dark:bg-bg-dark rounded-[48px] border border-zinc-100 dark:border-border-emerald flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6">Plan Trimestral</h4>
                                        <p className="text-3xl font-black text-zinc-900 dark:text-emerald-50 mb-1">$18.222</p>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">25% OFF + 10% OFF EXTRA</p>
                                    </div>
                                    <button 
                                        onClick={() => handleUpgrade('PRO_TRIMESTRAL')}
                                        disabled={loadingCheckout !== null}
                                        className="w-full py-4 text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all flex justify-center items-center gap-2">
                                        {loadingCheckout === 'PRO_TRIMESTRAL' ? <RefreshCw size={16} className="animate-spin" /> : 'Pagar Trimestral'}
                                    </button>
                                </div>
                            </div>
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
                                    <input
                                        type="password"
                                        className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm"
                                        placeholder="Contraseña Actual"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input
                                            type="password"
                                            className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm"
                                            placeholder="Nueva Contraseña"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="password"
                                            className="w-full p-5 bg-white dark:bg-bg-soft dark:text-white rounded-[24px] border-none font-bold text-zinc-700 shadow-sm"
                                            placeholder="Repetir Nueva Contraseña"
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
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
