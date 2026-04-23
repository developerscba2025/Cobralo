import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CreditCard, Target, Minus, Plus, DollarSign, Clock, ArrowRight, Infinity as InfinityIcon } from 'lucide-react';
import { type Student, type BusinessPaymentAccount } from '../../../services/api';

interface LiquidationStepProps {
    formData: Partial<Student>;
    setFormData: (data: any) => void;
    configType: 'weeks' | 'pack' | 'unique' | 'unlimited';
    setConfigType: (type: 'weeks' | 'pack' | 'unique' | 'unlimited') => void;
    weeklyFrequency: number;
    setWeeklyFrequency: (f: number | ((prev: number) => number)) => void;
    calculateAmount: () => number;
    onNext: () => void;
    onBack: () => void;
    currency: string;
    paymentAccounts?: BusinessPaymentAccount[];
}

const ModalityCard = ({ title, description, price, active, onClick, icon: Icon }: any) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left p-3.5 rounded-[20px] border-2 transition-all duration-500 flex flex-col gap-3 relative overflow-hidden group ${
            active
                ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_12px_40px_rgba(16,185,129,0.05)]'
                : 'border-border-main dark:border-white/10 bg-surface/50 dark:bg-white/10 hover:border-emerald-500/30 hover:-translate-y-1'
        }`}
    >
        {active && <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />}
        <div className="flex items-start justify-between relative z-10">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-text-muted/8 text-text-muted group-hover:bg-emerald-500/10 group-hover:text-emerald-500'}`}>
                <Icon size={18} />
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${active ? 'border-emerald-500 bg-emerald-500' : 'border-border-main'}`}>
                {active && <Plus size={14} strokeWidth={3} className="text-black rotate-45" />}
            </div>
        </div>
        <div className="relative z-10">
            <p className={`text-base font-black uppercase tracking-tight leading-none mb-2 ${active ? 'text-emerald-500' : 'text-text-main'}`}>{title}</p>
            <p className="text-[10px] font-bold text-text-muted dark:text-text-main/70 uppercase tracking-widest leading-relaxed line-clamp-2">{description}</p>
        </div>
        {price !== null && (
            <div className={`relative z-10 pt-4 border-t ${active ? 'border-emerald-500/20' : 'border-border-main/50'}`}>
                <p className="text-[10px] font-black tracking-tight text-text-main">{price}</p>
            </div>
        )}
    </button>
);

const LiquidationStep: React.FC<LiquidationStepProps> = ({
    formData, setFormData, configType, setConfigType, weeklyFrequency, setWeeklyFrequency, calculateAmount, onNext, onBack, currency, paymentAccounts = []
}) => {
    const cur = currency;
    const amt = calculateAmount();

    return (
        <motion.div
            key="step2"
            className="grid lg:grid-cols-[1fr_400px] min-h-full h-full overflow-hidden"
        >
            <div className="p-4 md:p-6 space-y-4 lg:h-full lg:overflow-y-auto custom-scrollbar">
                {/* Modality Selection */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Protocolo de Cobro</p>
                    <div className="grid grid-cols-2 gap-3">
                        <ModalityCard
                            title="Abono Mensual Fijo"
                            description="Pago mensual por días fijos."
                            price={null}
                            active={configType === 'weeks'}
                            onClick={() => setConfigType('weeks')}
                            icon={Calendar}
                        />
                        <ModalityCard
                            title="Pack de Clases"
                            description="Paquete de clases prepagas."
                            price={null}
                            active={configType === 'pack'}
                            onClick={() => setConfigType('pack')}
                            icon={CreditCard}
                        />
                        <ModalityCard
                            title="Clase Suelta"
                            description="Sesión única."
                            price={null}
                            active={configType === 'unique'}
                            onClick={() => setConfigType('unique')}
                            icon={Target}
                        />
                        <ModalityCard
                            title="Pase Libre"
                            description="Asistencia ilimitada."
                            price={null}
                            active={configType === 'unlimited'}
                            onClick={() => setConfigType('unlimited')}
                            icon={InfinityIcon}
                        />
                    </div>
                </div>

                {/* Specific Config */}
                <div className="glass-premium rounded-[20px] p-4 space-y-4 border border-white/5 bg-white/[0.02]">
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Frequency/Quantity */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
                                {configType === 'weeks' ? 'Días por semana' : configType === 'pack' ? 'Total clases mes' : 'Configuración'}
                            </p>
                            {configType === 'weeks' && (
                                <div className="h-[64px] flex items-center justify-between bg-bg-app dark:bg-white/10 rounded-[20px] border border-border-main dark:border-white/10 px-2">
                                    <button
                                        type="button"
                                        onClick={() => setWeeklyFrequency(v => Math.max(1, v - 1))}
                                        className="w-10 h-10 rounded-xl bg-surface dark:bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-text-muted transition-all flex items-center justify-center border border-border-main active:scale-90"
                                    >
                                        <Minus size={16} strokeWidth={3} />
                                    </button>
                                    <div className="flex-1 text-center flex flex-col justify-center">
                                        <span className="text-3xl font-black text-text-main tabular-nums leading-none">
                                            {weeklyFrequency}
                                        </span>
                                        <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest mt-1 leading-none">
                                            {weeklyFrequency === 1 ? 'VEZ' : 'VECES'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setWeeklyFrequency(v => Math.min(7, v + 1))}
                                        className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all flex items-center justify-center border border-emerald-500/20 active:scale-90"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            )}

                            {configType === 'pack' && (
                                <div className="h-[64px] flex items-center justify-between bg-bg-app dark:bg-white/10 rounded-[20px] border border-border-main dark:border-white/10 px-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p: any) => ({ ...p, classes_per_month: Math.max(1, (p.classes_per_month || 1) - 1) }))}
                                        className="w-10 h-10 rounded-xl bg-surface dark:bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-text-muted transition-all flex items-center justify-center border border-border-main active:scale-90"
                                    >
                                        <Minus size={16} strokeWidth={3} />
                                    </button>
                                    <div className="flex-1 text-center flex flex-col justify-center">
                                        <span className="text-3xl font-black text-text-main tabular-nums leading-none">
                                            {formData.classes_per_month}
                                        </span>
                                        <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest mt-1 leading-none">
                                            CLASES
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((p: any) => ({ ...p, classes_per_month: (p.classes_per_month || 0) + 1 }))}
                                        className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all flex items-center justify-center border border-emerald-500/20 active:scale-90"
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            )}

                            {configType === 'unique' && (
                                <div className="h-[64px] flex items-center px-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[20px]">
                                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest leading-relaxed">
                                        Modo individual activado. <br/> El cobro se realiza por sesión.
                                    </p>
                                </div>
                            )}

                            {configType === 'unlimited' && (
                                <div className="h-[64px] flex items-center px-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[20px]">
                                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest leading-relaxed">
                                        Pase libre activado. <br/> Asistencia ilimitada.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Price per Class */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
                                {configType === 'unlimited' ? 'Valor del Pase Libre' : 'Valor por Clase'}
                            </p>
                            <div className="h-[64px] bg-bg-app dark:bg-white/[0.08] border border-border-main dark:border-white/10 focus-within:border-emerald-500/40 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-[20px] flex items-center px-5 gap-3 transition-all">
                                <span className="text-emerald-500 font-black text-2xl shrink-0">{cur}</span>
                                <input
                                    type="number"
                                    className="flex-1 bg-transparent border-none text-text-main font-black text-3xl outline-none placeholder:text-text-muted/10 tracking-tighter"
                                    placeholder="0"
                                    value={formData.price_per_hour || ''}
                                    onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Duration */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Duración Estimada</p>
                                <div className="flex flex-wrap gap-2">
                                    {[30, 45, 60, 90, 120].map(val => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, class_duration_min: val })}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${
                                                formData.class_duration_min === val
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-surface/50 dark:bg-white/10 border-border-main dark:border-white/10 text-text-muted dark:text-text-main/80 hover:text-text-main hover:border-emerald-500/30'
                                            }`}
                                        >
                                            {val >= 60 ? `${val / 60}hs` : `${val} min`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Deadline Day */}
                            {(configType === 'weeks' || configType === 'unlimited') && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Vencimiento Mensual</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {[10, 15, 20].map(val => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, deadline_day: val })}
                                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${
                                                    formData.deadline_day === val
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                                                        : 'bg-surface/50 dark:bg-white/10 border-border-main dark:border-white/10 text-text-muted dark:text-text-main/80 hover:text-text-main hover:border-emerald-500/30'
                                                }`}
                                            >
                                                Día {val}
                                            </button>
                                        ))}
                                        <div className={`flex items-center bg-bg-app dark:bg-white/10 rounded-xl border p-1 w-fit transition-all ${
                                            ![10, 15, 20].includes(formData.deadline_day as number) && formData.deadline_day
                                                ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                                                : 'border-border-main dark:border-white/10'
                                        }`}>
                                            <input
                                                type="number"
                                                min="1" max="31"
                                                placeholder="Otro"
                                                className="w-12 py-1.5 bg-transparent text-text-main font-black text-xs outline-none transition-all text-center placeholder:text-text-muted/50"
                                                value={![10, 15, 20].includes(formData.deadline_day as number) ? (formData.deadline_day || '') : ''}
                                                onChange={e => setFormData({ ...formData, deadline_day: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Payment Method */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Medio de Cobro</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Efectivo', 'Transferencia', 'MP', 'Otro'].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, payment_method: opt as any })}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${
                                                formData.payment_method === opt
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-surface/50 dark:bg-white/10 border-border-main dark:border-white/10 text-text-muted dark:text-text-main/80 hover:text-text-main hover:border-emerald-500/30'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="h-[96px] w-full">
                                    <AnimatePresence mode="wait">
                                        {formData.payment_method === 'Transferencia' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -5 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-2 mt-4 pt-4 border-t border-white/5"
                                            >
                                                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Alias de Cobro</label>
                                                {paymentAccounts.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 py-1">
                                                        {paymentAccounts.map(acc => (
                                                            <button
                                                                key={acc.id}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, billing_alias: acc.alias })}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                                    formData.billing_alias === acc.alias 
                                                                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                                                                    : 'bg-white/5 text-text-muted hover:bg-white/10 border border-transparent'
                                                                }`}
                                                            >
                                                                {acc.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="relative">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white/10 border border-white/10 focus:border-emerald-500/30 rounded-2xl pl-10 pr-6 py-4 text-sm font-bold text-text-main outline-none transition-all placeholder:text-text-muted/20"
                                                        value={formData.billing_alias || ''}
                                                        onChange={e => setFormData({ ...formData, billing_alias: e.target.value })}
                                                        placeholder="Ingresá un nuevo Alias o CBU..."
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Summary Card */}
            <div className="border-l border-border-main/60 p-4 md:p-6 flex flex-col bg-emerald-500/[0.03]">
                <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-2">Resumen de Liquidación</p>
                    <h4 className="text-text-main font-black text-xl uppercase tracking-tighter leading-none">Proyección de Ingresos</h4>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                            {configType === 'pack' ? 'Total Pack' : configType === 'unique' ? 'Total Sesión' : 'Total Bruto Mes'}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-emerald-500 font-bold text-base">{cur}</span>
                            <span className="text-3xl font-black text-text-main tabular-nums leading-none">
                                {amt.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {[
                            { icon: <Calendar size={13} />, label: 'Modalidad', value: configType === 'unique' ? 'Individual' : configType === 'weeks' ? 'Mensual Fijo' : configType === 'unlimited' ? 'Pase Libre' : 'Pack de Clases' },
                            { icon: <Clock size={13} />, label: configType === 'pack' ? 'Cant. Clases' : 'Clases / Mes', value: configType === 'unique' ? '1 cl' : configType === 'weeks' ? `${weeklyFrequency * 4} cl` : configType === 'unlimited' ? 'Ilimitado' : `${formData.classes_per_month} cl` },
                            { icon: <DollarSign size={13} />, label: configType === 'pack' ? 'Valor del Pack' : configType === 'unlimited' ? 'Pase Mensual' : 'Valor Base', value: `${cur}${formData.price_per_hour || 0}` },
                            { icon: <Clock size={13} />, label: 'Vencimiento', value: (configType === 'unique' || configType === 'pack') ? 'Al consumir' : `Día ${formData.deadline_day || 10}` },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3 text-text-muted">
                                    <div className="opacity-40">{row.icon}</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{row.label}</span>
                                </div>
                                <span className="text-[11px] font-black text-text-main uppercase">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-6">
                    <button
                        type="button"
                        onClick={onNext}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs rounded-[20px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        Configurar Agenda
                        <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button type="button" onClick={onBack} className="w-full text-center text-[10px] font-black text-text-muted/40 hover:text-text-muted uppercase tracking-widest transition-colors py-2">
                        ← Volver a Datos
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default LiquidationStep;
