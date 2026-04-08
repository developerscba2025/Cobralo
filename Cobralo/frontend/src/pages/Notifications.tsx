import React, { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Calendar, DollarSign, Star, Zap, RefreshCw, X } from 'lucide-react';
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
};

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
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
            setNotifications(Array.isArray(data) ? data : []);
        } catch (e) { /* ignore */ }
        setLoading(false);
    }, []);

    const markAllRead = async () => {
        await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', headers: { ...getAuthHeader() } });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const markRead = async (id: number) => {
        await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH', headers: { ...getAuthHeader() } });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    useEffect(() => { load(); }, [load]);

    const groups = groupByDate(notifications);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Layout>
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase flex items-center gap-3">
                            <Bell size={24} className="text-primary-main" />
                            Notificaciones
                        </h1>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">
                            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={load} className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface transition-all">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-main rounded-xl text-[10px] font-black text-text-muted hover:text-primary-main hover:border-primary-main/30 transition-all uppercase tracking-widest"
                            >
                                <CheckCheck size={14} />
                                Marcar todo leído
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-surface/30 rounded-[2rem] border border-dashed border-border-main/50">
                        <div className="w-20 h-20 bg-primary-main/10 rounded-3xl flex items-center justify-center mb-6 animate-bounce duration-[3s]">
                            <Bell size={40} className="text-primary-main" />
                        </div>
                        <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">No hay ninguna notificación</h3>
                        <p className="text-sm text-text-muted mt-2 font-medium">Te avisaremos cuando ocurra algo importante en tu academia.</p>
                    </div>
                ) : (
                    Object.entries(groups).map(([date, items]) => (
                        <div key={date} className="space-y-2">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-2">{date}</p>
                            <div className="space-y-2">
                                {items.map(n => {
                                    const cfg = typeConfig[n.type] ?? { icon: <Bell size={18} />, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => !n.isRead && markRead(n.id)}
                                            className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all ${n.isRead ? 'bg-bg-app border-border-main opacity-60' : 'bg-surface border-border-main shadow-sm'}`}
                                        >
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                                                {cfg.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-text-main leading-tight truncate">{n.title}</p>
                                                    {!n.isRead && <div className="shrink-0 w-2 h-2 rounded-full bg-primary-main" />}
                                                </div>
                                                <p className="text-xs text-text-muted mt-1 leading-relaxed">{n.body}</p>
                                            </div>
                                            <span className="shrink-0 text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
                                                {relativeTime(n.createdAt)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default NotificationsPage;
