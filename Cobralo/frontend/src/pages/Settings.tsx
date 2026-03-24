import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { User, BusinessPaymentAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
    User as UserIcon, 
    Settings as Settings2, 
    Shield, 
    CreditCard, 
    Save, 
    Building2, 
    Trash2,
    MessageSquare,
    Star,
    Zap,
    ExternalLink,
    Edit3,
    Monitor,
    CheckCircle2,
    Lock as LockIcon,
    RefreshCw,
    Copy,
    Eye,
    EyeOff
} from 'lucide-react';
import { showToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { ProFeature, ProBadge } from '../components/ProGuard';

const Settings = () => {
    const { updateUser: updateAuthUser } = useAuth();
    const { setTheme, theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'business' | 'services' | 'subscription' | 'billing' | 'reminders' | 'ratings'>('profile');
    
    // Categories for organization
    const categories = [
        { 
            id: 'account', 
            label: 'General', 
            icon: Settings2, 
            tabs: [
                { id: 'profile', label: 'Mi Perfil', icon: UserIcon },
                { id: 'security', label: 'Seguridad', icon: Shield },
                { id: 'preferences', label: 'Preferencias', icon: Monitor }
            ] 
        },
        { 
            id: 'business', 
            label: 'Negocio', 
            icon: Building2, 
            tabs: [
                { id: 'business', label: 'Datos del Negocio', icon: Building2 },
                { id: 'services', label: 'Mis Servicios', icon: Zap }
            ] 
        },
        { 
            id: 'finances', 
            label: 'Finanzas', 
            icon: CreditCard, 
            tabs: [
                { id: 'subscription', label: 'Plan de Suscripción', icon: CreditCard },
                { id: 'billing', label: 'Cobros y Facturación', icon: ExternalLink }
            ] 
        },
        { 
            id: 'communication', 
            label: 'Comunicación', 
            icon: MessageSquare, 
            tabs: [
                { id: 'reminders', label: 'Plantillas de Mensaje', icon: MessageSquare },
                { id: 'ratings', label: 'Testimonios', icon: Star }
            ] 
        }
    ];
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [user, setUser] = useState<Partial<User>>({
        name: '', email: '', bizName: '', businessCategory: '', phoneNumber: '', taxId: '', billingAddress: '', bizAlias: '', reminderTemplate: 'Hola {alumno}! Te escribo de {negocio} para recordarte tu clase de {servicio}. El monto es de ${monto}. Saludos!',
        defaultPrice: 0, defaultService: 'General', defaultSurcharge: 10, currency: '$', receiptFooter: '',
        mpAccessToken: '', mpPublicKey: ''
    });
    const [showMPToken, setShowMPToken] = useState(false);

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
    const [paymentAccounts, setPaymentAccounts] = useState<BusinessPaymentAccount[]>([]);
    const [newPaymentAccount, setNewPaymentAccount] = useState({ name: '', alias: '', isDefault: false });

    // Dynamic price increase logic
    const [editingService, setEditingService] = useState<{ id: number; name: string; defaultPrice: string } | null>(null);

    useEffect(() => {
        fetchProfile();
        fetchUserServices();
        fetchRatings();
        fetchPaymentAccounts();
    }, []);

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


    const onUpdateService = async (updateStudents = false) => {
        if (!editingService) return;
        try {
            const result: any = await api.updateService(editingService.id, {
                name: editingService.name,
                defaultPrice: Number(editingService.defaultPrice),
                updateStudents
            });
            
            setUserServices(userServices.map(s => s.id === editingService.id ? result.service : s));
            setEditingService(null);
            showToast.success('Servicio actualizado');

        } catch (error) {
            showToast.error('Error al actualizar servicio');
        }
    };

    
    const fetchPaymentAccounts = async () => {
        try {
            const data = await api.getPaymentAccounts();
            setPaymentAccounts(data);
        } catch (error) {
            console.error('Error fetching payment accounts:', error);
        }
    };

    const handleAddPaymentAccount = async () => {
        if (!newPaymentAccount.name || !newPaymentAccount.alias) return;
        try {
            const added = await api.createPaymentAccount(newPaymentAccount);
            setPaymentAccounts([...paymentAccounts, added]);
            setNewPaymentAccount({ name: '', alias: '', isDefault: false });
            showToast.success('Cuenta de cobro agregada');
        } catch (error) {
            showToast.error('Error al agregar cuenta');
        }
    };

    const handleDeletePaymentAccount = async (id: number) => {
        try {
            await api.deletePaymentAccount(id);
            setPaymentAccounts(paymentAccounts.filter(a => a.id !== id));
            showToast.success('Cuenta eliminada');
        } catch (error) {
            showToast.error('Error al eliminar cuenta');
        }
    };

    const handleSetDefaultAccount = async (id: number) => {
        try {
            await api.updatePaymentAccount(id, { isDefault: true });
            setPaymentAccounts(paymentAccounts.map(a => ({
                ...a,
                isDefault: a.id === id
            })));
            showToast.success('Cuenta predeterminada actualizada');
        } catch (error) {
            showToast.error('Error al actualizar');
        }
    };

    const fetchProfile = async () => {
        try {
            const data = await api.getProfile();
            setUser({
                name: data.name || '',
                email: data.email || '',
                bizName: data.bizName || '',
                businessCategory: data.businessCategory || '',
                phoneNumber: data.phoneNumber || '',
                taxId: data.taxId || '',
                billingAddress: data.billingAddress || '',
                bizAlias: data.bizAlias || '',
                reminderTemplate: data.reminderTemplate || 'Hola {alumno}! Te escribo de {negocio} para recordarte tu clase de {servicio}. El monto es de ${monto}. Saludos!',
                defaultPrice: data.defaultPrice || 0,
                defaultService: data.defaultService || 'General',
                defaultSurcharge: data.defaultSurcharge || 10,
                currency: data.currency || '$',
                receiptFooter: data.receiptFooter || '',
                mpAccessToken: data.mpAccessToken || '',
                mpPublicKey: data.mpPublicKey || '',
            });
            setRatingToken(data.ratingToken || null);
            setRatingExpires(data.ratingTokenExpires || null);
            if (data.paymentAccounts) {
                setPaymentAccounts(data.paymentAccounts);
            }
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
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

    if (loading) return <Layout><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div></div></Layout>;

    // Removido TabButton auxiliar ya que usamos la sidebar del grid

    return (
        <Layout>
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Configuración</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Personalizá tu experiencia y gestioná tu cuenta.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-8">
                    {categories.map(cat => (
                        <div key={cat.id} className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-4 mb-2">
                                {cat.label}
                            </h3>
                            <div className="flex flex-col gap-1">
                                {cat.tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
                                            activeTab === tab.id
                                                ? 'bg-green-700 text-white shadow-lg shadow-green-100 dark:shadow-none translate-x-1'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <tab.icon size={18} className={activeTab === tab.id ? 'opacity-100' : 'opacity-50'} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className={`lg:col-span-9 bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-all ${activeTab === 'subscription' ? 'max-w-none' : 'max-w-full'}`}>
                    
                    {/* Main Settings Form (Tabs that save to User model) */}
                    {(activeTab === 'profile' || activeTab === 'business' || activeTab === 'billing' || activeTab === 'reminders' || activeTab === 'preferences') && (
                        <form onSubmit={handleSave}>
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <UserIcon size={20} className="text-green-600" /> Información Personal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Tu Nombre</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                            value={user.name}
                                            onChange={e => setUser({ ...user, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                            value={user.email}
                                            onChange={e => setUser({ ...user, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'business' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Building2 size={20} className="text-green-600" /> Detalles del Negocio
                                </h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Nombre del Negocio</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                                value={user.bizName}
                                                onChange={e => setUser({ ...user, bizName: e.target.value })}
                                                placeholder="Ej: Estudio Movimiento"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Categoría</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                                value={user.businessCategory || ''}
                                                onChange={e => setUser({ ...user, businessCategory: e.target.value })}
                                                placeholder="Ej: Yoga, Música, Idiomas..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Teléfono (WhatsApp)</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                                value={user.phoneNumber || ''}
                                                onChange={e => setUser({ ...user, phoneNumber: e.target.value })}
                                                placeholder="+54 9 11 2345 6789"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <CreditCard size={20} className="text-green-600" /> Cobros y Facturación
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">CUIT / CUIL</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                            value={user.taxId || ''}
                                            onChange={e => setUser({ ...user, taxId: e.target.value })}
                                            placeholder="20-33445566-7"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Dirección de Facturación</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                            value={user.billingAddress || ''}
                                            onChange={e => setUser({ ...user, billingAddress: e.target.value })}
                                            placeholder="Av. Santa Fe 1234, CABA"
                                        />
                                    </div>
                                </div>

                                <div className="border-y border-slate-100 dark:border-slate-800 py-8 my-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                            <Zap size={18} className="text-blue-600" /> Integración Mercado Pago (Cobro Automático)
                                        </h3>
                                        <a 
                                            href="https://www.mercadopago.com.ar/developers/panel/applications" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full transition-all"
                                        >
                                            Ir a MP Developers <ExternalLink size={12} />
                                        </a>
                                    </div>

                                    {/* Ayuda Mercado Pago */}
                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-3xl p-6 mb-6">
                                        <h4 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Monitor size={14} /> ¿Cómo obtener tus credenciales?
                                        </h4>
                                        <ul className="space-y-2 text-xs text-blue-800/70 dark:text-blue-300/70 font-medium">
                                            <li className="flex gap-2">
                                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                                                <span>Entrá a <strong>Mercado Pago Developers</strong> con tu cuenta habitual.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                                                <span>Andá a <strong>"Tus aplicaciones"</strong> y creá una nueva (o elegí una existente).</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                                                <span>En el menú lateral, hacé clic en <strong>"Credenciales de producción"</strong>.</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">4</span>
                                                <span>Copiá el <strong>Access Token</strong> y la <strong>Public Key</strong> y pegalos aquí debajo.</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Access Token (Producción)</label>
                                            <div className="relative">
                                                <input
                                                    type={showMPToken ? "text" : "password"}
                                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                                    value={user.mpAccessToken || ''}
                                                    onChange={e => setUser({ ...user, mpAccessToken: e.target.value })}
                                                    placeholder="APP_USR-..."
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowMPToken(!showMPToken)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                                >
                                                    {showMPToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Public Key</label>
                                            <input
                                                type="text"
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                                value={user.mpPublicKey || ''}
                                                onChange={e => setUser({ ...user, mpPublicKey: e.target.value })}
                                                placeholder="APP_USR-..."
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 ml-1 italic flex items-center gap-1">
                                        <Shield size={10} /> Tus tokens se guardan de forma segura para procesar tus cobros.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <CreditCard size={18} className="text-green-600" /> Mis Cuentas de Cobro (CBU/Alias)
                                    </h3>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Plataforma (ej: Mercado Pago)"
                                                className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                                                value={newPaymentAccount.name}
                                                onChange={e => setNewPaymentAccount({ ...newPaymentAccount, name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="CBU o Alias"
                                                className="w-full p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                                                value={newPaymentAccount.alias}
                                                onChange={e => setNewPaymentAccount({ ...newPaymentAccount, alias: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddPaymentAccount}
                                                className="bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-green-200 dark:shadow-none"
                                            >
                                                Agregar Cuenta
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {paymentAccounts.length === 0 ? (
                                            <p className="text-center py-6 text-slate-400 italic text-sm">No tenés cuentas configuradas.</p>
                                        ) : (
                                            paymentAccounts.map(account => (
                                                <div key={account.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-green-200 dark:hover:border-green-900 transition shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl ${account.isDefault ? 'bg-green-100 text-green-600 dark:bg-green-600/10' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
                                                            <CreditCard size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800 dark:text-white">{account.name}</p>
                                                                {account.isDefault && <span className="text-[10px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-md uppercase tracking-tighter">Predeterminada</span>}
                                                            </div>
                                                            <p className="text-sm font-bold text-green-600 tracking-tight">{account.alias}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!account.isDefault && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetDefaultAccount(account.id)}
                                                                className="p-2 text-slate-400 hover:text-green-600 transition"
                                                            >
                                                                <CheckCircle2 size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePaymentAccount(account.id)}
                                                            className="p-2 text-slate-300 hover:text-red-500 transition"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}



                        {activeTab === 'reminders' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <MessageSquare size={20} className="text-green-600" /> Plantillas de Mensajes <ProBadge />
                                </h2>
                                <ProFeature featureName="Plantillas de WhatsApp">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Mensaje de Recordatorio</label>
                                            <textarea
                                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-medium text-slate-700 min-h-[120px]"
                                                value={user.reminderTemplate}
                                                onChange={e => setUser({ ...user, reminderTemplate: e.target.value })}
                                            />
                                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-600/10 rounded-2xl">
                                                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">Variables disponibles:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {['{alumno}', '{monto}', '{negocio}', '{servicio}', '{subcategoria}', '{metodo}', '{vencimiento}', '{alias}'].map(v => (
                                                        <code key={v} className="bg-white dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-mono">{v}</code>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Vista Previa</h3>
                                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 relative group">
                                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                    {user.reminderTemplate
                                                        ?.replace('{alumno}', 'Juan Perez')
                                                        ?.replace('{monto}', '5000')
                                                        ?.replace('{negocio}', user.bizName || 'Mi Negocio')
                                                        ?.replace('{servicio}', 'Clase de Yoga')
                                                        ?.replace('{subcategoria}', 'Avanzado')
                                                        ?.replace('{metodo}', 'Transferencia')
                                                        ?.replace('{vencimiento}', '10')
                                                        ?.replace('{alias}', user.bizAlias || 'mi.alias.mp')
                                                    }
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const text = user.reminderTemplate
                                                            ?.replace('{alumno}', 'Juan Perez')
                                                            ?.replace('{monto}', '5000')
                                                            ?.replace('{negocio}', user.bizName || 'Mi Negocio')
                                                            ?.replace('{servicio}', 'Clase de Yoga')
                                                            ?.replace('{subcategoria}', 'Avanzado')
                                                            ?.replace('{metodo}', 'Transferencia')
                                                            ?.replace('{vencimiento}', '10')
                                                            ?.replace('{alias}', user.bizAlias || 'mi.alias.mp');
                                                        navigator.clipboard.writeText(text || '');
                                                        showToast.success('Copiado al portapapeles');
                                                    }}
                                                    className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-green-600 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                    title="Copiar prueba"
                                                >
                                                    <Copy size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </ProFeature>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Monitor size={20} className="text-green-600" /> Preferencias y Aspecto
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-wider">Tema Visual</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Personalizá cómo se ve Cobralo.</p>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => setTheme('light')}
                                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-green-600 shadow-md' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 border border-transparent'}`}
                                            >
                                                Claro
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setTheme('dark')}
                                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 text-white border-2 border-green-600 shadow-lg' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 border border-transparent'}`}
                                            >
                                                Oscuro
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-wider">Notificaciones</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Alertas de pagos y clases.</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-6 bg-green-600 rounded-full relative p-1 shadow-inner">
                                                <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Activadas</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-4 ml-1 tracking-[0.2em]">Valores por Defecto</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Servicio por Defecto</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: Yoga, Inglés, etc." 
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400" 
                                            value={user.defaultService || ''} 
                                            onChange={e => setUser({ ...user, defaultService: e.target.value })} 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Precio x Hora por Defecto</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{user.currency || '$'}</span>
                                            <input 
                                                type="number" 
                                                placeholder="0" 
                                                className="w-full p-4 pl-10 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400" 
                                                value={user.defaultPrice || ''} 
                                                onChange={e => setUser({ ...user, defaultPrice: Number(e.target.value) })} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Moneda</label>
                                        <input 
                                            type="text" 
                                            placeholder="$" 
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400 text-center" 
                                            value={user.currency || ''} 
                                            onChange={e => setUser({ ...user, currency: e.target.value })} 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">% Recargo Mora por Defecto</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                placeholder="10" 
                                                className="w-full p-4 pr-10 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400" 
                                                value={user.defaultSurcharge || ''} 
                                                onChange={e => setUser({ ...user, defaultSurcharge: Number(e.target.value) })} 
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                        </div>
                                    </div>
                                </div>

                                <ProFeature featureName="Personalización de Recibos">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Pie de Página en Recibos (PDF) <ProBadge /></label>
                                        <textarea 
                                            rows={3}
                                            placeholder="Ej: Gracias por tu pago. ¡Nos vemos en clase!" 
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-medium text-slate-700" 
                                            value={user.receiptFooter || ''} 
                                            onChange={e => setUser({ ...user, receiptFooter: e.target.value })} 
                                        />
                                        <p className="text-[10px] text-slate-400 ml-2 italic">Este texto aparecerá al final de todos tus recibos generados.</p>
                                    </div>
                                </ProFeature>
                            </div>
                        )}

                        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-green-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg hover:bg-green-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={20} />
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <Zap size={20} className="text-green-600" /> Mis Servicios y Precios
                        </h2>
                        
                        <div className="bg-green-50 dark:bg-green-600/10 p-6 rounded-[32px] border border-green-100 dark:border-green-600/20 mb-6">
                            <h3 className="text-sm font-bold text-green-800 dark:text-green-200 mb-4">Agregar Nuevo Servicio</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    className="w-full p-4 bg-white dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-bold placeholder-slate-400"
                                    value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Precio"
                                    className="w-full p-4 bg-white dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none font-bold placeholder-slate-400"
                                    value={newService.defaultPrice}
                                    onChange={e => setNewService({ ...newService, defaultPrice: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    className="bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-green-200 dark:shadow-none"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {userServices.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="font-medium">No has definido servicios personalizados todavía.</p>
                                </div>
                            ) : (
                                userServices.map(service => (
                                    <div key={service.id} className="flex flex-col p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition hover:shadow-md">
                                        {editingService?.id === service.id ? (
                                            <div className="space-y-4 w-full">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-none outline-none font-bold"
                                                        value={editingService?.name || ''}
                                                        onChange={e => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                    />
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{user.currency}</span>
                                                        <input
                                                            type="number"
                                                            className="w-full p-3 pl-8 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl border-none outline-none font-bold"
                                                            value={editingService?.defaultPrice || ''}
                                                            onChange={(e) => {
                                                                if (editingService) {
                                                                    setEditingService({ ...editingService, defaultPrice: e.target.value });
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={async () => {
                                                            if (!editingService) return;
                                                            await onUpdateService(false);
                                                        }} 
                                                        className="flex-1 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button type="button" onClick={() => setEditingService(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-600/10 flex items-center justify-center text-green-600">
                                                        <Zap size={22} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-lg">{service.name}</p>
                                                        <p className="text-sm font-bold text-green-600">Precio base: {user.currency}{Number(service.defaultPrice).toLocaleString('es-AR')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (service.id) {
                                                                setEditingService({
                                                                    id: service.id,
                                                                    name: service.name,
                                                                    defaultPrice: (service.defaultPrice || 0).toString()
                                                                });
                                                            }
                                                        }}
                                                        className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-600/10 rounded-2xl transition"
                                                        title="Editar"
                                                    >
                                                        <Edit3 size={20} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => service.id && handleDeleteService(service.id)}
                                                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}



                {activeTab === 'subscription' && (
                    <div className="space-y-12">
                        {/* Plan Status Header */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <Zap size={20} className="text-amber-500" /> Estado de Suscripción
                            </h2>
                            <div className={`p-8 rounded-[32px] border ${user.isPro ? 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800'} transition-all`}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${user.isPro ? 'bg-amber-400 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'} shadow-lg`}>
                                            <Zap size={32} fill={user.isPro ? 'currentColor' : 'none'} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Plan {user.plan || 'Gratuito'}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                {user.isPro ? 'Disfrutás de todas las funciones premium' : 'Usando la versión gratuita limitada'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => showToast.error('Mejora próximamente')}
                                        className={`px-8 py-4 rounded-2xl font-black text-sm transition-all ${user.isPro ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white' : 'bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none'}`}>
                                        {user.isPro ? 'Administrar Plan' : 'Pasar a Pro'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-8">
                        <div>
                             <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <LockIcon size={20} className="text-green-600" /> Cambio de Contraseña
                            </h2>
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1 tracking-wider">Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-green-600 outline-none font-bold text-slate-700 placeholder-slate-400"
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
                                        className="bg-slate-900 dark:bg-green-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {changingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-4">
                                <Trash2 size={20} /> Zona de Peligro
                            </h2>
                            <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-100 dark:border-red-500/20">
                                <h3 className="font-bold text-red-900 dark:text-red-400 mb-2">Eliminar Cuenta</h3>
                                <p className="text-sm text-red-800/60 dark:text-red-400/60 mb-6">
                                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de haber descargado todos tus datos antes de proceder.
                                </p>
                                <button 
                                    onClick={() => showToast.error('Función no disponible por ahora')}
                                    className="px-6 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all"
                                >
                                    Solicitar Eliminación
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ratings' && (
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <Star size={20} className="text-amber-500 fill-amber-500" /> Gestionar Calificaciones
                            </h2>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center shadow-inner">
                                        <Star size={40} className="fill-current" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Tu Link de Calificación <ProBadge /></h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed max-w-md">
                                            Compartí este link temporal con tus alumnos cada mes para que puedan evaluarte. Las calificaciones son 100% privadas.
                                        </p>
                                    </div>
                                    <ProFeature featureName="Gestión de Testimonios" inline>
                                        <button 
                                            onClick={handleGenerateLink}
                                            className="bg-slate-900 dark:bg-green-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
                                        >
                                            <RefreshCw size={18} />
                                            GENERAR NUEVO LINK
                                        </button>
                                    </ProFeature>
                                </div>

                                {ratingToken && (
                                    <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-amber-100 dark:border-amber-500/20 shadow-sm">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Tu Link Público</label>
                                        <div className="flex gap-3">
                                            <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl font-mono text-xs font-bold text-green-600 truncate flex items-center">
                                                {`${window.location.origin}/rate/${ratingToken}`}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/rate/${ratingToken}`);
                                                    showToast.success('¡Link copiado!');
                                                }}
                                                className="p-4 bg-green-50 dark:bg-green-600/10 text-green-600 rounded-2xl hover:bg-green-100 transition shadow-sm"
                                                title="Copiar Link"
                                            >
                                                <Copy size={20} />
                                            </button>
                                            <a 
                                                href={`/rate/${ratingToken}`} 
                                                target="_blank" 
                                                className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl hover:bg-slate-200 transition shadow-sm"
                                                title="Ver Vista Previa"
                                            >
                                                <ExternalLink size={20} />
                                            </a>
                                        </div>
                                        <p className="mt-3 text-[10px] font-bold text-amber-600/60 uppercase tracking-widest text-center">
                                            Este link expirará el {new Date(ratingExpires!).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <ProFeature featureName="Gestión Avanzada de Testimonios">
                            <section>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Últimos Testimonios</h3>
                                {ratings.length === 0 ? (
                                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <MessageSquare size={32} />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase tracking-tighter">Aún no recibiste calificaciones</p>
                                        <p className="text-slate-300 text-xs font-bold mt-1">Generá un link y empezá a colectar feedback hoy.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {ratings.map(r => (
                                            <div key={r.id} className="p-6 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm transition hover:shadow-md group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                size={14} 
                                                                className={i < r.value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => handleToggleRatingVisibility(r.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${r.showComment !== false ? 'text-slate-400 hover:text-green-600' : 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'}`}
                                                            title={r.showComment !== false ? 'Ocultar comentario' : 'Mostrar comentario'}
                                                        >
                                                            {r.showComment !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                                        </button>
                                                        <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <p className={`text-slate-600 dark:text-slate-300 font-medium italic mb-4 line-clamp-3 ${r.showComment === false ? 'opacity-30 blur-[2px]' : ''}`}>
                                                    {r.showComment !== false ? `"${r.comment}"` : '"Comentario oculto por moderación"'}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-400">
                                                        {r.studentName?.[0] || 'A'}
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{r.studentName || 'Anónimo'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </ProFeature>
                    </div>
                )}
            </div>
        </div>
    </Layout>
);
};

export default Settings;

