import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Send, CheckCircle2, 
    ArrowRight, Share2,
    Percent, Zap,
    Minus, Plus
} from 'lucide-react';
import { api } from '../services/api';
import { showToast } from './Toast';

interface Student {
    id: number;
    name: string;
    phone: string;
    amount: number;
    service_name: string;
    sub_category?: string | null;
    billing_alias?: string | null;
}

interface PriceUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    // These might be empty if we are starting the flow from scratch
    students?: Student[];
    currency: string;
    bizName: string;
    bizAlias: string;
    template: string;
}

const PriceUpdateModal: React.FC<PriceUpdateModalProps> = ({
    isOpen,
    onClose,
    students: initialStudents = [],
    currency,
    bizName,
    bizAlias,
    template
}) => {
    const [step, setStep] = useState(1);
    const [percentage, setPercentage] = useState(10);
    const [selectedService, setSelectedService] = useState('Todos');
    const [services, setServices] = useState<string[]>(['Todos']);
    const [loading, setLoading] = useState(false);
    const [updatedStudents, setUpdatedStudents] = useState<Student[]>(initialStudents);

    // If initialStudents are passed, maybe we should skip to success? 
    // But let's assume this is the main tool now.
    useEffect(() => {
        if (isOpen) {
            const loadServices = async () => {
                try {
                    const data = await api.getServices();
                    const names = data.map(s => s.name);
                    setServices(['Todos', ...names]);
                } catch (err) {
                    console.error('Error loading services', err);
                }
            };
            loadServices();
            
            if (initialStudents.length > 0) {
                setUpdatedStudents(initialStudents);
                setStep(2);
            } else {
                setStep(1);
            }
        }
    }, [isOpen, initialStudents]);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await api.updatePrices({ percentage, service: selectedService });
            
            // Fetch updated students to show in the next step
            // For now, let's assume the API returns success and we might need to refresh
            // But since we want to show notification cards, we'll fetch them
            const all = await api.getStudents();
            const filtered = selectedService === 'Todos' 
                ? all 
                : all.filter(s => s.service_name === selectedService);
            
            setUpdatedStudents(filtered);
            setStep(2);
            showToast.success('Precios actualizados correctamente');
        } catch (error) {
            showToast.error('Error al actualizar precios');
        } finally {
            setLoading(false);
        }
    };

    const generateWaLink = (student: Student) => {
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        const message = template
            .replace('{alumno}', student.name)
            .replace('{monto}', Number(student.amount).toLocaleString('es-AR'))
            .replace('{negocio}', bizName || 'Mi Negocio')
            .replace('{servicio}', serviceName)
            .replace('{alias}', student.billing_alias || bizAlias || 'mi-alias');

        return `https://wa.me/${(student.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 modal-overlay z-[2000] flex items-center justify-center p-0 sm:p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="glass-premium w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[48px] overflow-hidden flex flex-col relative"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                            <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[100px] rounded-full" />
                            <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-main/10 blur-[100px] rounded-full" />
                        </div>

                        {/* Close button always visible */}
                        <button 
                            onClick={onClose}
                            className="absolute right-8 top-8 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:bg-white/10 hover:text-text-main transition-all z-50 group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                            {step === 1 ? (
                                /* STEP 1: CONFIGURATION */
                                <div className="flex-1 overflow-y-auto px-8 sm:px-12 pt-16 pb-10 custom-scrollbar z-10">
                                    <div className="space-y-1 mb-10 text-center sm:text-left">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary-main/10 border border-primary-main/20 rounded-full w-fit mx-auto sm:mx-0">
                                            <Zap size={12} className="text-primary-main" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-main">Ajuste de Precios</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-text-main tracking-tight leading-tight pt-2">
                                            Actualiza tus <br /><span className="text-emerald-500">Tarifas en Bloque</span>
                                        </h2>
                                        <p className="text-text-muted font-bold text-sm max-w-sm mt-3 mx-auto sm:mx-0">
                                            Ajusta el valor de tus servicios de forma masiva con un par de clics.
                                        </p>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Percentage Selector */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 flex items-center gap-2">
                                                <Percent size={14} /> Porcentaje de Aumento
                                            </p>
                                            <div className="glass-premium p-8 rounded-[36px] border-white/5 flex flex-col items-center gap-6">
                                                <div className="flex items-center gap-8">
                                                    <button 
                                                        onClick={() => setPercentage(Math.max(0, percentage - 5))}
                                                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-main hover:bg-emerald-500 hover:text-black transition-all active:scale-90"
                                                    >
                                                        <Minus size={24} strokeWidth={3} />
                                                    </button>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-6xl font-black text-text-main tracking-tighter">%{percentage}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-2">Aumento Recomendado</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setPercentage(percentage + 5)}
                                                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-main hover:bg-emerald-500 hover:text-black transition-all active:scale-90"
                                                    >
                                                        <Plus size={24} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, percentage * 2)}%` }}
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-primary-main"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Selection */}
                                        <div className="space-y-4 pb-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 flex items-center gap-2">
                                                <Zap size={14} /> Seleccionar Servicio
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {services.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSelectedService(s)}
                                                        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                                            selectedService === s
                                                            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                                            : 'bg-white/5 text-text-muted border border-white/10 hover:border-emerald-500/30'
                                                        }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* STEP 2: SUCCESS / NOTIFICATIONS */
                                <>
                                    {/* Top Header */}
                                    <div className="relative px-8 sm:px-12 pt-16 pb-6 flex items-start justify-between z-10">
                                        <div className="space-y-1">
                                            <motion.div 
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Ajuste Completado</span>
                                            </motion.div>
                                            <h2 className="text-44xl sm:text-5xl font-black text-text-main tracking-tight leading-tight pt-2">
                                                ¡Todo listo, <br /><span className="text-emerald-500">Profe!</span>
                                            </h2>
                                            <p className="text-text-muted font-bold text-sm max-w-sm mt-3">
                                                Hemos actualizado <span className="text-text-main">{updatedStudents.length} alumnos</span>. Notifícales por WhatsApp para mayor transparencia.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metrics Summary */}
                                    <div className="px-8 sm:px-12 mb-6 z-10">
                                        <div className="p-1 glass-premium rounded-[32px] border-white/5 flex gap-1">
                                            <div className="flex-1 bg-white/5 rounded-[24px] p-4 flex flex-col items-center justify-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 text-center">Alumnos</p>
                                                <p className="text-2xl font-black text-text-main">{updatedStudents.length}</p>
                                            </div>
                                            <div className="flex-1 bg-emerald-500/10 rounded-[24px] p-4 flex flex-col items-center justify-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-1 text-center">Aumento</p>
                                                <p className="text-2xl font-black text-emerald-500">%{percentage}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Students List with Animation */}
                                    <div className="flex-1 overflow-y-auto px-8 sm:px-12 pb-10 custom-scrollbar z-10">
                                        <motion.div 
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-4"
                                        >
                                            {updatedStudents.map((student) => (
                                                <motion.div 
                                                    key={student.id}
                                                    variants={cardVariants}
                                                    className="group relative p-5 bg-white/[0.03] dark:bg-black/20 border border-white/[0.05] rounded-[32px] hover:bg-white/[0.07] dark:hover:bg-white/[0.03] transition-all duration-300 hover:border-emerald-500/30"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary-main/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                                                <span className="text-xl font-black text-emerald-500 leading-none">{student.name.charAt(0)}</span>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="font-black text-text-main group-hover:text-emerald-500 transition-colors uppercase tracking-tight leading-none mb-1">{student.name}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black tracking-widest uppercase">Actualizado</span>
                                                                    <p className="text-[11px] font-black text-text-muted/60 uppercase tracking-wide truncate max-w-[120px]">{student.service_name}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                                                            <div className="flex flex-col items-end">
                                                                <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest mb-0.5 leading-none">Nueva Cuota</p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-[10px] font-black text-text-muted/40 tracking-tighter">{currency}</span>
                                                                    <p className="text-2xl font-black text-text-main tracking-tighter leading-none">
                                                                        {Number(student.amount).toLocaleString('es-AR')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {student.phone ? (
                                                                <a
                                                                    href={generateWaLink(student)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="w-12 h-12 bg-[#25D366] text-black rounded-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-[#25D366]/20 border border-white/10"
                                                                >
                                                                    <Send size={20} strokeWidth={3} />
                                                                </a>
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted/20">
                                                                    <Share2 size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </>
                            )}

                            {/* FOOTER */}
                            <div className="px-8 sm:px-12 py-8 border-t border-white/5 glass-premium z-20 flex flex-col sm:flex-row gap-6 items-center justify-between mt-auto">
                                <div className="hidden sm:flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">Seguridad de Datos</p>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                        <span className="text-xs font-black text-text-main uppercase tracking-widest">Encriptación Activa</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full sm:w-auto">
                                    {step === 1 ? (
                                        <button
                                            onClick={handleUpdate}
                                            disabled={loading}
                                            className="w-full sm:min-w-[240px] h-16 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Actualizar Ahora
                                                    <ArrowRight size={18} strokeWidth={3} />
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onClose}
                                            className="w-full sm:min-w-[240px] h-16 bg-white/5 border border-white/10 text-text-main font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
                                        >
                                            Finalizar Proceso
                                            <CheckCircle2 size={18} strokeWidth={3} className="text-emerald-500" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PriceUpdateModal;
