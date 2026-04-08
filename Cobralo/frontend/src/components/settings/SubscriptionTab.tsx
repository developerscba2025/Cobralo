import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, HelpCircle, RefreshCw } from 'lucide-react';

interface SubscriptionTabProps {
    user: any;
    isPro: boolean;
    subscriptionPlans: any[];
    priceLastUpdate: string | null;
    pendingAdjustment: any;
    loadingCheckout: string | null;
    handleUpgrade: (planId: string) => void;
    handleCancelSubscription: () => void;
    cancelingSubscription: boolean;
    subscriptionStatus: string | null;
}

const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
    user, isPro, subscriptionPlans, priceLastUpdate, pendingAdjustment, loadingCheckout, handleUpgrade,
    handleCancelSubscription, cancelingSubscription, subscriptionStatus
}) => {
    const [isTrimestral, setIsTrimestral] = useState(false);

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                    <Zap size={24} className="text-amber-500" /> Mi Suscripción
                </h2>
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Estado y beneficios de tu plan.</p>
            </div>

            {/* Current plan card */}
            <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[48px] border-2 transition-all sm:p-12 ${isPro ? 'bg-amber-400/5 border-amber-400/20' : 'bg-bg-app border-border-main'}`}>
                <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10">
                    <div className={`w-16 h-16 lg:w-24 lg:h-24 rounded-[24px] lg:rounded-[36px] flex items-center justify-center transition-all ${isPro ? 'bg-amber-400 text-white shadow-xl shadow-amber-400/20' : 'bg-surface text-zinc-400'}`}>
                        <Zap size={32} fill={isPro ? 'currentColor' : 'none'} className="lg:hidden" />
                        <Zap size={48} fill={isPro ? 'currentColor' : 'none'} className="hidden lg:block" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg lg:text-2xl font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-tight">
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
                    <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => user.plan !== 'PRO' && document.getElementById('pricing-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className={`px-6 py-4 lg:px-10 lg:py-5 rounded-2xl lg:rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${isPro ? 'bg-primary-main/10 text-primary-main border border-primary-main/20 cursor-default' : 'bg-primary-main text-white shadow-xl shadow-primary-glow hover:bg-green-600 w-full lg:w-auto'}`}
                        >
                            {user.plan === 'PRO' ? 'Suscripción Activa' : (user.plan === 'INITIAL' ? 'Pasar a Pro (25% OFF)' : 'Activar Pro')}
                        </button>
                        
                        {isPro && subscriptionStatus === 'CANCEL_AT_PERIOD_END' && (
                            <div className="px-6 py-4 lg:py-5 rounded-2xl lg:rounded-[24px] font-black text-xs uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 text-center">
                                Baja Programada
                            </div>
                        )}
                        
                        {isPro && subscriptionStatus !== 'CANCEL_AT_PERIOD_END' && (
                            <button
                                onClick={handleCancelSubscription}
                                disabled={cancelingSubscription}
                                className="px-6 py-4 lg:py-5 rounded-2xl lg:rounded-[24px] font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                            >
                                {cancelingSubscription ? 'Procesando...' : 'Dar de baja'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {priceLastUpdate && (
                <div className="p-6 bg-zinc-500/5 dark:bg-bg-dark border border-zinc-500/10 rounded-[32px] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-emerald-500/10 text-zinc-500 flex items-center justify-center shrink-0"><HelpCircle size={24} /></div>
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
                        Información de Precios: Los ajustes se realizan mensualmente según el 50% del IPC.
                        <span className="block mt-1 opacity-60 font-black text-[8px]">Última actualización: {new Date(priceLastUpdate).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
                    </p>
                </div>
            )}

            {pendingAdjustment && !pendingAdjustment.applied && (() => {
                const activationDate = new Date(pendingAdjustment.activationDate);
                const daysUntil = Math.ceil((activationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntil <= 10 && daysUntil >= 0) {
                    return (
                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20"><Zap size={24} /></div>
                            <div className="flex-1">
                                <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] mb-1">Próximo Ajuste Programado</h5>
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                                    Precios se ajustarán un <span className="p-1 bg-amber-500 text-white rounded-md mx-1">+{pendingAdjustment.percent.toFixed(1)}%</span>
                                    a partir del {activationDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}.
                                </p>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            {/* Pricing grid */}
            <div id="pricing-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic plan */}
                <div className="p-4 lg:p-10 bg-bg-app rounded-[24px] lg:rounded-[48px] border border-border-main flex flex-col justify-between relative overflow-hidden">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-4 right-4 bg-emerald-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(22,163,74,0.3)]">25% OFF</motion.div>
                    <div>
                        <h4 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-[0.2em] mb-8">Plan Básico</h4>
                        <div className="flex items-baseline gap-2 mb-1">
                            <p className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-emerald-50 tracking-tighter uppercase">{basicPlan?.priceFormatted || '$5.242'}</p>
                            <span className="text-sm text-zinc-400 line-through decoration-red-500/40 font-bold mb-1">{basicOriginalFormatted}</span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">/ mes</span>
                        </div>
                        <p className="text-[10px] font-black text-primary-main uppercase tracking-widest mb-6">Prueba de 14 días</p>
                        <div className="space-y-4 mb-8">
                            {['Acceso total a herramientas', 'Gestión de alumnos y pagos', 'Recordatorios automáticos'].map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                                    <Zap size={12} className="fill-current text-primary-main/40" /> {f}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center py-4 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-[8px] font-black uppercase text-zinc-400 tracking-tighter">Incluido al registrarse</span>
                    </div>
                </div>

                {/* Pro plan */}
                <div className="p-4 lg:p-10 bg-bg-app rounded-[24px] lg:rounded-[48px] border-2 border-emerald-500/20 flex flex-col justify-between relative overflow-hidden shadow-[0_0_20px_rgba(22,163,74,0.05)]">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(22,163,74,0.4)]">25% OFF</motion.div>
                    <div>
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Plan Pro</h4>
                        <div className="flex bg-surface p-1 rounded-xl mb-6 border border-border-main">
                            <button onClick={() => setIsTrimestral(false)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${!isTrimestral ? 'bg-primary-main text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}>Mensual</button>
                            <button onClick={() => setIsTrimestral(true)} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${isTrimestral ? 'bg-primary-main text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}>Trimestral</button>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <p className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-emerald-50 uppercase tracking-tighter">
                                {isTrimestral ? (proTrimestralPlan?.priceFormatted || '$30.352') : (proMonthlyPlan?.priceFormatted || '$11.242')}
                            </p>
                            <span className="text-sm text-zinc-400 line-through decoration-red-500/40 font-bold">{isTrimestral ? proTrimestralOriginalFormatted : proMonthlyOriginalFormatted}</span>
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">{isTrimestral ? 'Pago único trimestral' : 'Facturación mensual'}</p>
                        <div className="space-y-3 mb-8">
                            {['Alumnos ilimitados', 'Dashboard PRO & Gráficos', 'Sincronización Google Calendar', 'Mensajes para WhatsApp automatizados', 'Integración experta Mercado Pago', 'Reportes financieros & Recibos', 'Perfil destacado en la página'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-[10px] font-black text-text-main uppercase tracking-widest leading-none bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-all hover:scale-[1.02]">
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
                        className="w-full py-4 text-xs font-black uppercase tracking-widest bg-primary-main text-white rounded-2xl shadow-lg shadow-primary-glow hover:bg-green-600 transition-all flex justify-center items-center gap-2"
                    >
                        {loadingCheckout ? <RefreshCw size={16} className="animate-spin" /> : (isTrimestral ? 'Pagar PRO Trimestral' : 'Pagar PRO Mensual')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionTab;
