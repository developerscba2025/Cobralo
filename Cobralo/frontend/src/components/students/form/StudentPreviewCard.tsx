import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Zap, ShieldCheck, CreditCard } from 'lucide-react';

interface StudentPreviewCardProps {
    name: string;
    serviceName: string;
    phone: string;
    modality: 'MONTHLY' | 'PACK' | 'PER_CLASS' | 'UNLIMITED';
    amount: number;
    currency: string;
}

const StudentPreviewCard: React.FC<StudentPreviewCardProps> = ({
    name, serviceName, phone, modality, amount, currency
}) => {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : null;

    const modalityLabels = {
        'MONTHLY': 'Suscripción Mensual',
        'PACK': 'Pack de Clases',
        'PER_CLASS': 'Clase Individual',
        'UNLIMITED': 'Pase Libre'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[320px] aspect-[3/4] relative group"
        >
            {/* Background Glows */}
            <div className="absolute -inset-4 bg-emerald-500/10 blur-[40px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* The Card */}
            <div className="relative h-full w-full bg-surface/60 dark:bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[42px] overflow-hidden p-8 flex flex-col shadow-2xl">
                
                {/* Header Decor */}
                <div className="absolute top-0 right-0 p-6 opacity-20">
                    <ShieldCheck size={40} className="text-emerald-500" />
                </div>

                {/* Avatar Section */}
                <div className="mt-4 flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center font-black text-3xl transition-all duration-700 ${name ? 'bg-emerald-500 text-black shadow-[0_12px_40px_rgba(16,185,129,0.3)] scale-105' : 'bg-white/5 text-text-muted/20 scale-95'}`}>
                        {initials || <User size={36} />}
                    </div>
                    
                    <div className="mt-6 space-y-2">
                        <h3 className="text-xl font-black text-text-main tracking-tight uppercase leading-none truncate max-w-[240px]">
                            {name || <span className="opacity-30">Nuevo Alumno</span>}
                        </h3>
                        {serviceName && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                <Zap size={10} fill="currentColor" />
                                {serviceName}
                            </div>
                        )}
                        {phone && (
                            <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted font-bold opacity-60">
                                <Phone size={10} />
                                {phone}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-text-muted">
                            <CreditCard size={12} className="opacity-50" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Modality</span>
                        </div>
                        <span className="text-[10px] font-black text-text-main uppercase tracking-tight">
                            {modalityLabels[modality] || 'Pendiente'}
                        </span>
                    </div>

                    <div className="bg-emerald-500/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-emerald-500/10">
                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Estimado Mensual</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-emerald-500 font-bold text-sm">{currency}</span>
                            <span className="text-3xl font-black text-text-main tabular-nums leading-none">
                                {amount.toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentPreviewCard;
