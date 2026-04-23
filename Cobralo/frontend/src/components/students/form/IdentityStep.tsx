import React from 'react';
import { User, Phone, Tag, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StudentPreviewCard from './StudentPreviewCard';
import { type Student, type UserService } from '../../../services/api';

interface IdentityStepProps {
    formData: Partial<Student>;
    setFormData: (data: any) => void;
    userServices: UserService[];
    setShowServicePopup: (show: boolean) => void;
    onNext: () => void;
    currency: string;
    calculateAmount: () => number;
}

const Field = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="space-y-2">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">
            {icon} {label}
        </p>
        {children}
    </div>
);

const TextInput = ({ value, onChange, placeholder, type = 'text' }: any) => (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-bg-app dark:bg-white/5 border border-border-main focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/8 rounded-[20px] px-4 py-3.5 text-text-main font-bold text-sm outline-none transition-all placeholder:text-text-muted/30"
        />
);

const IdentityStep: React.FC<IdentityStepProps> = ({
    formData, setFormData, userServices, setShowServicePopup, onNext, currency, calculateAmount
}) => {
    const isStep1Complete = formData.name && formData.phone && formData.service_name;

    return (
        <motion.div
            key="step1"
            className="grid lg:grid-cols-[1fr_460px] min-h-full h-full overflow-y-auto lg:overflow-hidden"
        >
            {/* Left: Form */}
            <div className="p-5 md:p-8 space-y-6 lg:h-full lg:overflow-y-auto flex flex-col">
                <div className="space-y-5 flex-1">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Información personal</p>
                        <div className="grid md:grid-cols-2 gap-5">
                            <Field label="Nombre completo" icon={<User size={13} />}>
                                <TextInput
                                    value={formData.name}
                                    onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Juan Pérez"
                                />
                            </Field>
                            <Field label="Teléfono WhatsApp" icon={<Phone size={13} />}>
                                <TextInput
                                    value={formData.phone}
                                    onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+54 9 11 ..."
                                />
                            </Field>
                        </div>
                        <Field label="Etiqueta rápida (opcional)" icon={<Tag size={13} />}>
                            <TextInput
                                value={formData.sub_category}
                                onChange={(e: any) => setFormData({ ...formData, sub_category: e.target.value })}
                                placeholder="Turno, nivel, observaciones..."
                            />
                        </Field>
                    </div>

                    {/* Activity Selector */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Actividad Principal</p>
                        <div className="flex flex-wrap gap-2.5">
                            {userServices.map(s => {
                                const active = formData.service_name === s.name;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, service_name: s.name, price_per_hour: Number(s.defaultPrice) || prev.price_per_hour }))}
                                        className={`px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                                            active
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-[0_8px_20px_rgba(16,185,129,0.15)]'
                                                : 'bg-surface/50 dark:bg-white/5 border-border-main text-text-muted hover:text-text-main hover:border-emerald-500/20'
                                        }`}
                                    >
                                        {active && <Check size={12} strokeWidth={3} />}
                                        {s.name}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                onClick={() => setShowServicePopup(true)}
                                className="px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border border-dashed border-border-main text-text-muted hover:border-emerald-500/50 hover:text-emerald-500 transition-all bg-white/[0.02]"
                            >
                                + Nueva Actividad
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer buttons for mobile (hidden on desktop) */}
                <div className="lg:hidden mt-6">
                    <button
                        type="button"
                        disabled={!isStep1Complete}
                        onClick={onNext}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-xs rounded-[20px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        Continuar
                        <ArrowRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Right: Preview & Large Button */}
            <div className="hidden lg:flex flex-col border-l border-border-main/60 bg-surface/20 dark:bg-black/10 p-6 md:p-8 overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center scale-105">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40 mb-6">Vista Previa de Tarjeta</p>
                    <StudentPreviewCard 
                        name={formData.name || ''}
                        serviceName={formData.service_name || ''}
                        phone={formData.phone || ''}
                        modality={formData.planType || 'MONTHLY'}
                        amount={calculateAmount()}
                        currency={currency}
                    />
                </div>

                <div className="space-y-3 pt-6">
                    <button
                        type="button"
                        disabled={!isStep1Complete}
                        onClick={onNext}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-xs rounded-[20px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        Siguiente Paso
                        <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    {!isStep1Complete && (
                        <p className="text-center text-[10px] text-text-muted/40 font-bold uppercase tracking-widest">
                            Completa nombre, celular y actividad
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default IdentityStep;
