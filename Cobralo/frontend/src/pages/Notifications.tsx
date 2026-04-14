import React, { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Calendar, DollarSign, Star, Zap, RefreshCw, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

interface AppNotification {
    id: number;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    metadata?: string;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    CLASS_CONFIRMED: { icon: <Calendar size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    CLASS_CANCELLED: { icon: <X size={18} />, color: 'text-red-400', bg: 'bg-red-400/10' },
    PAYMENT_RECEIVED: { icon: <DollarSign size={18} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    REMINDER_SENT: { icon: <Bell size={18} />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    NEW_RATING: { icon: <Star size={18} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    SUBSCRIPTION_RENEWED: { icon: <Zap size={18} />, color: 'text-primary-main', bg: 'bg-primary-main/10' },
    PRO_REMINDER_SENT: { icon: <Zap size={18} />, color: 'text-primary-main', bg: 'bg-primary-main/10' },
    ANNOUNCEMENT: { icon: <Zap size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
};

const SYSTEM_NOTIFICATIONS: AppNotification[] = [
    {
        id: -1,
        type: 'ANNOUNCEMENT',
        title: '🤖 Beta: Portal del Alumno',
        body: 'Estamos construyendo un espacio de autogestión para tus alumnos. ¡Próximamente podrán ver sus créditos y pagos solos!',
        isRead: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: -2,
        type: 'ANNOUNCEMENT',
        title: '📈 Próximamente: Gastos y AFIP',
        body: 'Muy pronto vas a poder registrar tus gastos operativos y exportar reportes optimizados para tu contador.',
        isRead: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: -3,
        type: 'ANNOUNCEMENT',
        title: '📱 Desarrollo: App Móvil Nativa',
        body: 'Llevá Cobralo en tu bolsillo. Estamos terminando el desarrollo para iOS y Android con notificaciones push en tiempo real.',
        isRead: false,
        createdAt: new Date().toISOString(),
    }
];

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
}

function groupByDate(notifications: AppNotification[]) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const groups: Record<string, AppNotification[]> = {};
    for (const n of notifications) {
        const d = new Date(n.createdAt); d.setHours(0, 0, 0, 0);
        let key: string;
        if (d.getTime() === today.getTime()) key = 'Hoy';
        else if (d.getTime() === yesterday.getTime()) key = 'Ayer';
        else key = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
    }
    return groups;
}

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications`, { headers: { ...getAuthHeader() } });
            const data = await res.json();
            const fetched = Array.isArray(data) ? data : [];
            
            const readSystemIds = JSON.parse(localStorage.getItem('read-system-notifications') || '[]');
            const systemWithReadState = SYSTEM_NOTIFICATIONS.map(n => ({
                ...n,
                isRead: readSystemIds.includes(n.id)
            }));

            const all = [...systemWithReadState, ...fetched].sort((a,b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(all);
        } catch (e) { 
            const readSystemIds = JSON.parse(localStorage.getItem('read-system-notifications') || '[]');
            const systemWithReadState = SYSTEM_NOTIFICATIONS.map(n => ({
                ...n,
                isRead: readSystemIds.includes(n.id)
            }));
            setNotifications(systemWithReadState);
        }
        setLoading(false);
    }, []);

    const markAllRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', headers: { ...getAuthHeader() } });
            const systemIds = SYSTEM_NOTIFICATIONS.map(n => n.id);
            localStorage.setItem('read-system-notifications', JSON.stringify(systemIds));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            
            // Sync count
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (e) {
            console.error(e);
        }
    };

    const markRead = async (id: number) => {
        try {
            if (id < 0) {
                const readSystemIds = JSON.parse(localStorage.getItem('read-system-notifications') || '[]');
                if (!readSystemIds.includes(id)) {
                    readSystemIds.push(id);
                    localStorage.setItem('read-system-notifications', JSON.stringify(readSystemIds));
                }
            } else {
                await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', headers: { ...getAuthHeader() } });
            }
            
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            
            // Sync count
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { load(); }, [load]);

    const groups = groupByDate(notifications);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Layout>
            <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter uppercase italic flex items-center gap-4">
                            Centro de Alertas <span className="text-xs font-black px-2 py-1 bg-primary-main/10 text-primary-main rounded-lg not-italic shadow-lg shadow-primary-main/5 animate-pulse">LIVE</span>
                        </h1>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                            {unreadCount > 0 ? `Tenés ${unreadCount} novedades sin revisar` : 'Estás al día con tu academia'}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={load} 
                            disabled={loading}
                            className="p-3.5 rounded-2xl bg-surface border border-border-main text-text-muted hover:text-primary-main hover:border-primary-main/30 transition-all active:scale-95"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-3 px-6 py-3.5 bg-primary-main text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-glow hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <CheckCheck size={16} />
                                Marcar todo leído
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-12">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-24 bg-surface/50 rounded-[2.5rem] border border-border-main animate-pulse" />
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-surface/30 rounded-[3rem] border border-dashed border-border-main/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary-main/5 blur-[120px] rounded-full" />
                            <div className="w-24 h-24 bg-primary-main/10 rounded-[2rem] flex items-center justify-center mb-8 relative z-10">
                                <Bell size={48} className="text-primary-main" />
                            </div>
                            <h3 className="text-2xl font-black text-text-main uppercase tracking-tight relative z-10">¡Todo en Orden!</h3>
                            <p className="text-sm text-text-muted mt-2 font-medium relative z-10">No hay novedades por el momento.</p>
                        </div>
                    ) : (
                        Object.entries(groups).map(([date, items]) => (
                            <div key={date} className="space-y-4">
                                <div className="flex items-center gap-4 ml-4">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic opacity-40">{date}</span>
                                    <div className="h-px flex-1 bg-border-main/50" />
                                </div>
                                <div className="grid gap-3">
                                    <AnimatePresence mode="popLayout">
                                        {items.map(n => {
                                            const cfg = typeConfig[n.type] ?? { icon: <Bell size={18} />, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
                                            return (
                                                <motion.button
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={n.id}
                                                    onClick={() => !n.isRead && markRead(n.id)}
                                                    className={`group w-full text-left flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${
                                                        n.isRead 
                                                        ? 'bg-transparent border-border-main opacity-60 backdrop-blur-sm grayscale' 
                                                        : 'bg-surface border-border-main shadow-xl hover:border-primary-main/30'
                                                    }`}
                                                >
                                                    {!n.isRead && (
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 -z-10" />
                                                    )}
                                                    
                                                    <div className={`shrink-0 w-14 h-14 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 ${cfg.bg} ${cfg.color}`}>
                                                        {cfg.icon}
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <p className="text-sm font-black text-text-main uppercase tracking-tight truncate">{n.title}</p>
                                                            {!n.isRead && (
                                                                <span className="shrink-0 w-2 h-2 rounded-full bg-primary-main shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-text-muted/80 leading-relaxed font-accent">{n.body}</p>
                                                    </div>
                                                    
                                                    <div className="shrink-0 flex flex-col items-end gap-2">
                                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">
                                                            {relativeTime(n.createdAt)}
                                                        </span>
                                                        {!n.isRead && (
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-black text-primary-main uppercase tracking-[0.2em] italic">
                                                                Leer <ArrowRight size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default NotificationsPage;
