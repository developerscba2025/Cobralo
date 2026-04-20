import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Calendar, CreditCard, User, Phone, Zap, ChevronUp, ChevronDown, Check, ArrowRight, LayoutGrid, Clock, Tag, DollarSign, X, Search } from 'lucide-react';
import { api, type Student, type UserService } from '../../services/api';
import { showToast } from '../Toast';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: Student | null;
    user: any;
    userServices: UserService[];
    refreshServices: () => Promise<void>;
}

// --- SUB-COMPONENTS (Clean Premium Styling) - Fuera para evitar re-montaje ---
const StepIndicatorComp = ({ currentStep, stepNum, label }: { currentStep: number, stepNum: number, label: string }) => (
    <div className="flex items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${currentStep >= stepNum ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-surface text-text-muted border border-border-main'}`}>
        {currentStep > stepNum ? <Check size={18} strokeWidth={3} /> : stepNum}
      </div>
      <span className={`hidden lg:block text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${currentStep >= stepNum ? 'text-text-main' : 'text-text-muted opacity-50'}`}>
        {label}
      </span>
    </div>
);

const InputFieldComp = ({ label, icon, value, onChange, placeholder = "Ingresar valor...", type = "text" }: any) => (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
        {icon} <span className="text-text-main">{label}</span>
      </p>
      <input 
        type={type} 
        value={value}
        onChange={onChange}
        className="w-full bg-surface border border-border-main focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-6 py-4 text-text-main font-bold text-base outline-none transition-all placeholder:text-text-muted/50"
        placeholder={placeholder}
      />
    </div>
);

const SelectCardComp = ({ title, subtitle, active, onClick, icon: Icon }: any) => (
    <button 
      type="button"
      onClick={onClick}
      className={`p-6 rounded-[24px] border-2 text-left transition-all duration-300 flex flex-col gap-2 relative overflow-hidden group ${active ? 'border-emerald-500/50 bg-emerald-500/5 shadow-sm' : 'border-border-main bg-surface hover:border-emerald-500/30'}`}
    >
      <div className="flex justify-between items-start">
         <p className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-emerald-500' : 'text-text-muted'}`}>{title}</p>
         {Icon && <Icon size={16} className={active ? 'text-emerald-500' : 'text-text-muted'} />}
      </div>
      <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{subtitle}</p>
    </button>
);

const SummaryItemComp = ({ icon, label, value, highlight }: any) => (
    <div className="flex justify-between items-center py-3 border-b border-border-main last:border-0">
      <div className="flex items-center gap-3 text-text-muted">
        <div className="p-2 bg-text-muted/5 rounded-lg">{icon}</div>
        <span className="text-[10px] uppercase tracking-widest font-black">{label}</span>
      </div>
      <span className={`text-xs font-black uppercase ${highlight ? 'text-emerald-500' : 'text-text-main'}`}>{value}</span>
    </div>
);

const StudentFormModal: React.FC<StudentFormModalProps> = ({ 
    isOpen, onClose, onSuccess, student, user, userServices, refreshServices 
}) => {
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        phone: '',
        service_name: '',
        price_per_hour: 0,
        classes_per_month: 4,
        payment_method: 'Efectivo',
        deadline_day: 10,
        planType: 'MONTHLY', // Internal logic: MONTHLY, PACK, PER_CLASS
        credits: 0,
        sub_category: '',
        billing_alias: '',
        class_duration_min: 60,
        isFlexible: false
    });
    
    // UI Helpers for the new logic
    const [configType, setConfigType] = useState<'weeks' | 'month' | 'unique'>('weeks');
    const [weeklyFrequency, setWeeklyFrequency] = useState(1);
    
    // New Service Popup States
    const [showServicePopup, setShowServicePopup] = useState(false);
    const [newServiceData, setNewServiceData] = useState({ name: '', price: 0 });
    const [isSavingService, setIsSavingService] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formSchedules, setFormSchedules] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);
    const [existingSchedules, setExistingSchedules] = useState<any[]>([]);
    const [agendaMode, setAgendaMode] = useState<'custom' | 'existing'>('custom');
    const [groupSearchTerm, setGroupSearchTerm] = useState('');

    useEffect(() => {
        const loadAllSchedules = async () => {
            try {
                const data = await api.getAllSchedules();
                setExistingSchedules(data);
            } catch (err) {
                console.error("Error fetching schedules", err);
            }
        };
        if (isOpen) loadAllSchedules();
    }, [isOpen]);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                phone: student.phone,
                service_name: student.service_name,
                price_per_hour: student.price_per_hour,
                classes_per_month: student.classes_per_month,
                payment_method: student.payment_method,
                deadline_day: student.deadline_day,
                planType: student.planType || 'MONTHLY',
                credits: student.credits || 0,
                sub_category: student.sub_category || '',
                billing_alias: student.billing_alias || user?.bizAlias || '',
                class_duration_min: student.class_duration_min || 60,
                isFlexible: student.schedules?.length === 0
            });
            
            // Map logic back to UI
            if (student.planType === 'PER_CLASS') setConfigType('unique');
            else if (student.planType === 'PACK') setConfigType('month'); // We'll treat Packs as 'Month' for UI simplicity or keep them distinct
            else setConfigType('weeks');
            
            setWeeklyFrequency(Math.max(1, Math.round((student.classes_per_month || 4) / 4)));
            
            setFormSchedules(student.schedules?.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime
            })) || []);
        } else {
            setFormData({
                name: '', phone: '', service_name: '',
                price_per_hour: 0, classes_per_month: 4,
                payment_method: 'Efectivo', deadline_day: 10,
                planType: 'MONTHLY', credits: 0, sub_category: '',
                billing_alias: user?.bizAlias || '', class_duration_min: 60,
                isFlexible: false
            });
            setFormSchedules([]);
            setConfigType('weeks');
            setFormSchedules([]);
            setAgendaMode('custom');
            setGroupSearchTerm('');
        }
        setFormStep(1);
    }, [student, user, isOpen, userServices.length]); // Removido userServices para evitar que el form se limpie al añadir una actividad

    const calculateAmount = () => {
        const pph = Number(formData.price_per_hour) || 0;
        const duration = Number(formData.class_duration_min) || 60;
        const ratio = duration / 60;
        
        if (configType === 'unique') return Math.round(pph * ratio);
        if (configType === 'weeks') return Math.round(pph * ratio * weeklyFrequency * 4);
        return Math.round(pph * ratio * (formData.classes_per_month || 0));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = calculateAmount();
        
        const payload: any = {
            ...formData,
            amount,
            // Re-sync plan types for backend
            planType: configType === 'unique' ? 'PER_CLASS' : (configType === 'month' ? 'PACK' : 'MONTHLY'),
            classes_per_month: configType === 'weeks' ? weeklyFrequency * 4 : formData.classes_per_month,
            class_duration_min: formData.class_duration_min || 60,
            deadline_day: formData.deadline_day ? Number(formData.deadline_day) : 10,
            due_day: formData.deadline_day ? Number(formData.deadline_day) : 10,
            schedules: formSchedules
        };

        setLoading(true);
        try {
            if (student) {
                await api.updateStudent(student.id, payload);
                showToast.success('Alumno actualizado');
            } else {
                await api.createStudent(payload);
                showToast.success('Alumno creado con éxito 🚀');
            }
            onSuccess();
        } catch (error) {
            showToast.error(student ? 'Error al actualizar' : 'Error al crear alumno');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async () => {
        if (!newServiceData.name) return showToast.error('Ingresá un nombre');
        setIsSavingService(true);
        try {
            const created = await api.createService({ 
                name: newServiceData.name, 
                defaultPrice: Number(newServiceData.price) 
            });
            await refreshServices();
            setFormData(prev => ({ 
                ...prev, 
                service_name: created.name,
                price_per_hour: Number(created.defaultPrice)
            }));
            setShowServicePopup(false);
            setNewServiceData({ name: '', price: 0 });
            showToast.success('Actividad creada');
        } catch (error) {
            showToast.error('Error al crear actividad');
        } finally {
            setIsSavingService(false);
        }
    };

    if (!isOpen) return null;

    const isStep1Complete = formData.name && formData.phone && formData.service_name;
    
    // --- LÓGICA DE AGENDA (Restaurada) ---
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
    const DAY_SHORT: { [key: number]: string } = { 1: 'LUN', 2: 'MAR', 3: 'MIÉ', 4: 'JUE', 5: 'VIE', 6: 'SÁB', 0: 'DOM' };

    const toggleDay = (day: number) => {
        setFormSchedules(prev => {
            const exists = prev.find(s => s.dayOfWeek === day);
            if (exists) return prev.filter(s => s.dayOfWeek !== day);
            
            // Validar límite si es plan por semana
            if (configType === 'weeks' && prev.length >= weeklyFrequency) {
                showToast.error(`Límite alcanzado: El plan es de ${weeklyFrequency} días por semana.`);
                return prev;
            }

            const startH = user?.workStartHour ?? 8;
            const startTimeStr = `${String(startH).padStart(2, '0')}:00`;
            const endTimeStr = `${String(startH + 1).padStart(2, '0')}:00`;

            return [...prev, { dayOfWeek: day, startTime: startTimeStr, endTime: endTimeStr }];
        });
    };

    const updateDayTime = (day: number, time: string) => {
        setFormSchedules(prev => prev.map(s =>
            s.dayOfWeek === day ? { ...s, startTime: time } : s
        ));
    };

    const adjustDayTime = (day: number, part: 'h' | 'm', delta: number) => {
        const schedule = formSchedules.find(s => s.dayOfWeek === day);
        if (!schedule) return;

        let [h, m] = schedule.startTime.split(':').map(Number);
        
        if (part === 'h') {
            h = (h + delta + 24) % 24;
        } else {
            m = (m + delta + 60) % 60;
        }

        const newTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        updateDayTime(day, newTime);
    };


    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-0 md:p-6 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-surface border border-border-main w-full max-w-[1100px] h-full md:h-[80vh] md:max-h-[800px] flex flex-col md:rounded-[32px] shadow-2xl relative overflow-hidden mx-auto"
            >

                {/* Header SaaS Premium */}
                <div className="px-6 md:px-10 py-5 md:py-6 border-b border-border-main bg-surface dark:bg-bg-app flex flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-text-main tracking-tight uppercase leading-none">
                                {student ? 'Actualizar Alumno' : 'Registrar Alumno'}
                            </h2>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-80">Registro de Alumnos</p>
                        </div>
                        <div className="h-10 w-px bg-border-main hidden md:block" />
                        <div className="flex items-center gap-8">
                            <StepIndicatorComp currentStep={formStep} stepNum={1} label="Identidad" />
                            <div className={`h-[2px] w-8 rounded-full ${formStep > 1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                            <StepIndicatorComp currentStep={formStep} stepNum={2} label="Liquidación" />
                            <div className={`h-[2px] w-8 rounded-full ${formStep > 2 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                            <StepIndicatorComp currentStep={formStep} stepNum={3} label="Agenda" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-zinc-600 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-6 md:py-8">
                    <form onSubmit={handleSubmit} className="h-full">
                        <AnimatePresence mode="wait">
                            {formStep === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid lg:grid-cols-[1fr_380px] gap-12 h-full items-start"
                                >
                                    <div className="space-y-12 max-w-2xl">
                                        <div className="space-y-8">
                                            <div className="flex flex-col gap-1 border-b border-border-main pb-4">
                                                <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Información Personal</h3>
                                                <p className="text-xs text-text-muted font-bold">Completá los datos básicos de identidad y contacto del alumno.</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <InputFieldComp 
                                                    label="Nombre Completo" 
                                                    icon={<User size={14} />} 
                                                    value={formData.name} 
                                                    onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} 
                                                    placeholder="Ej: Juan Pérez"
                                                />
                                                <InputFieldComp 
                                                    label="Teléfono WhatsApp" 
                                                    icon={<Phone size={14} />} 
                                                    value={formData.phone} 
                                                    onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} 
                                                    placeholder="Ej: 351 555 4433"
                                                />
                                            </div>
                                            <InputFieldComp 
                                                label="Etiqueta / Nota Rápida" 
                                                icon={<Tag size={14} />} 
                                                value={formData.sub_category} 
                                                onChange={(e: any) => setFormData({ ...formData, sub_category: e.target.value })} 
                                                placeholder="Ej: Turno Tarde, Nivel Avanzado..."
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex flex-col gap-1 border-b border-border-main pb-4">
                                                <p className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                                                    <LayoutGrid size={16} className="text-emerald-500" /> Actividad Principal
                                                </p>
                                                <p className="text-xs text-text-muted font-bold">Asigná el módulo de aprendizaje al que pertenece el alumno.</p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {userServices.map(s => (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, service_name: s.name, price_per_hour: Number(s.defaultPrice) || prev.price_per_hour }))}
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest ${
                                                            formData.service_name === s.name
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-sm'
                                                            : 'bg-surface dark:bg-bg-dark border-border-main text-text-muted hover:border-emerald-500/30'
                                                        }`}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowServicePopup(true)} 
                                                    className="px-5 py-2.5 rounded-xl text-[10px] font-bold border border-dashed border-border-main text-text-muted hover:text-emerald-500 hover:border-emerald-500/50 transition-all uppercase tracking-widest bg-black/[0.02] dark:bg-white/5"
                                                >
                                                    + Crear
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Resumen (Paso 1) */}
                                    <div className="bg-surface dark:bg-bg-soft border border-border-main rounded-[2.5rem] shadow-sm sticky top-0 overflow-hidden">
                                        
                                        {/* Avatar Preview */}
                                        <div className="p-8 pb-6 flex flex-col items-center gap-4 border-b border-border-main">
                                            <div className="relative">
                                                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center font-black text-2xl text-white transition-all duration-300 shadow-lg ${formData.name ? 'bg-emerald-500 shadow-emerald-500/20 scale-100' : 'bg-black/10 dark:bg-white/5 scale-95'}`}>
                                                    {formData.name
                                                        ? formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                                        : <User size={32} className="text-text-muted/30" />
                                                    }
                                                </div>
                                                {formData.name && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                                        <Check size={12} className="text-black" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="font-black text-text-main text-base uppercase tracking-tight leading-tight">
                                                    {formData.name || <span className="text-text-muted/40 text-sm">Sin nombre aún</span>}
                                                </p>
                                                {formData.service_name && (
                                                    <span className="mt-1.5 inline-flex px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        {formData.service_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Summary Items */}
                                        <div className="p-6 space-y-1">
                                            <SummaryItemComp icon={<Phone size={14} />} label="Contacto" value={formData.phone || '---'} />
                                            <SummaryItemComp icon={<LayoutGrid size={14} />} label="Módulo" value={formData.service_name || '---'} highlight={!!formData.service_name} />
                                        </div>

                                        <div className="px-6 pb-6">
                                            <button 
                                                type="button" 
                                                disabled={!isStep1Complete}
                                                onClick={() => setFormStep(2)} 
                                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] rounded-[20px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 group"
                                            >
                                                Siguiente Paso
                                                <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            {!isStep1Complete && (
                                                <p className="text-center text-[9px] font-bold text-text-muted/50 uppercase tracking-widest mt-3">
                                                    Completá nombre y módulo
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid lg:grid-cols-[1fr_380px] gap-12 h-full items-start"
                                >
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                <CreditCard size={14} /> Modalidad de Cobro
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <SelectCardComp 
                                                    title="Por Semana" 
                                                    subtitle="Clases por semana" 
                                                    active={configType === 'weeks'} 
                                                    onClick={() => setConfigType('weeks')} 
                                                    icon={Calendar}
                                                />
                                                <SelectCardComp 
                                                    title="Pack Mensual" 
                                                    subtitle="Total clases al mes" 
                                                    active={configType === 'month'} 
                                                    onClick={() => setConfigType('month')} 
                                                    icon={CreditCard}
                                                />
                                                <SelectCardComp 
                                                    title="Clase Suelta" 
                                                    subtitle="Pago por sesión" 
                                                    active={configType === 'unique'} 
                                                    onClick={() => setConfigType('unique')} 
                                                    icon={Target}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-surface dark:bg-[#111113] p-8 rounded-[2.5rem] border border-border-main space-y-8 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Frequency / Capacity */}
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                        {configType === 'weeks' ? 'Frecuencia Semanal' : configType === 'month' ? 'Carga Horaria Mensual' : 'Sesión Única'}
                                                    </p>
                                                    {configType !== 'unique' ? (
                                                        <div className="group relative">
                                                            
                                                            <div className="relative flex items-center bg-black/[0.02] dark:bg-white/5 rounded-[24px] border border-border-main p-1 transition-all duration-500">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => configType === 'weeks' ? setWeeklyFrequency(prev => Math.max(1, prev - 1)) : setFormData(prev => ({ ...prev, classes_per_month: Math.max(1, (prev.classes_per_month || 1) - 1) }))} 
                                                                    className="w-14 h-14 rounded-[20px] bg-surface dark:bg-bg-dark hover:bg-emerald-500/10 hover:text-emerald-500 transition-all flex items-center justify-center text-text-muted font-black border border-border-main active:scale-90"
                                                                >
                                                                    <div className="w-4 h-0.5 bg-current rounded-full" />
                                                                </button>
                                                                
                                                                <div className="flex-1 text-center">
                                                                    <div className="text-3xl font-bold text-text-main tracking-tight">
                                                                        {configType === 'weeks' ? weeklyFrequency : formData.classes_per_month}
                                                                        <span className="text-sm text-text-muted ml-2 font-bold uppercase tracking-widest text-[10px]">
                                                                            {configType === 'weeks' ? (weeklyFrequency === 1 ? 'vez' : 'veces') : 'clases'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => configType === 'weeks' ? setWeeklyFrequency(prev => Math.min(7, prev + 1)) : setFormData(prev => ({ ...prev, classes_per_month: (prev.classes_per_month || 0) + 1 }))} 
                                                                    className="w-14 h-14 rounded-[20px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all flex items-center justify-center font-black border border-emerald-500/20 active:scale-90"
                                                                >
                                                                    <Plus size={24} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Modo Sesión Independiente</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price / Rate - Mechanical Upgrade */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tasa de Intercambio</p>
                                                    </div>
                                                    
                                                    <div className="relative group">
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-2xl group-focus-within:scale-110 transition-transform">
                                                            {user?.currency || '$'}
                                                        </div>
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-6 py-5 pl-14 pr-[110px] text-zinc-900 dark:text-emerald-50 font-black text-3xl outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 tracking-tight"
                                                            placeholder="0" 
                                                            value={formData.price_per_hour || ''} 
                                                            onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })} 
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                            <div className="hidden sm:flex items-center px-3 py-1.5 bg-zinc-200/50 dark:bg-white/5 rounded-xl border border-zinc-300/30 dark:border-white/10">
                                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest">/ CL</span>
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setFormData(prev => ({ ...prev, price_per_hour: (prev.price_per_hour || 0) + 500 }))}
                                                                    className="p-1 hover:bg-emerald-500 hover:text-black rounded-lg transition-all text-emerald-500 cursor-pointer active:scale-90"
                                                                >
                                                                    <ChevronUp size={18} strokeWidth={3} />
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => setFormData(prev => ({ ...prev, price_per_hour: Math.max(0, (prev.price_per_hour || 0) - 500) }))}
                                                                    className="p-1 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-all text-zinc-400 cursor-pointer active:scale-90"
                                                                >
                                                                    <ChevronDown size={18} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-border-main" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Duration */}
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bloque de Tiempo</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[30, 45, 60, 90, 120].map(val => (
                                                            <button
                                                                key={val}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, class_duration_min: val })}
                                                                className={`px-5 py-2.5 rounded-[14px] text-[10px] font-bold transition-all border uppercase ${
                                                                    formData.class_duration_min === val
                                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50'
                                                                    : 'bg-surface dark:bg-bg-dark border-border-main text-text-muted hover:border-emerald-500/30'
                                                                }`}
                                                            >
                                                                {val >= 60 ? `${val/60} hs` : `${val} m`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Method */}
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Medio Preferido</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Efectivo', 'Transferencia', 'MP', 'Otro'].map(opt => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, payment_method: opt as any })}
                                                                className={`px-5 py-2.5 rounded-[14px] text-[10px] font-bold transition-all border uppercase ${
                                                                    formData.payment_method === opt
                                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50'
                                                                    : 'bg-surface dark:bg-bg-dark border-border-main text-text-muted hover:border-emerald-500/30'
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Liquidación (Paso 2) */}
                                    <div className="bg-surface dark:bg-[#111113] border border-border-main p-8 rounded-[2.5rem] shadow-sm space-y-8 sticky top-0 overflow-hidden group">
                                        
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Liquidación Proyectada</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-2xl font-black mb-1.5 text-emerald-500">{user?.currency || '$'}</span>
                                                <span className="text-5xl font-black tracking-tight leading-none text-text-main">
                                                    {calculateAmount().toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-border-main" />

                                        <div className="space-y-4">
                                            <SummaryItemComp icon={<Calendar size={14} />} label="Modalidad" value={configType === 'unique' ? 'Único' : (configType === 'weeks' ? 'Semanal' : 'Mensual')} highlight />
                                            <SummaryItemComp icon={<Clock size={14} />} label="Capacidad" value={configType === 'unique' ? '1 cl' : (configType === 'weeks' ? `${weeklyFrequency * 4} cl/mes` : `${formData.classes_per_month} cl/mes`)} />
                                            <SummaryItemComp icon={<DollarSign size={14} />} label="Tasa Base" value={`${user?.currency || '$'}${formData.price_per_hour}/cl`} />
                                        </div>

                                        <div className="pt-4 space-y-4">
                                            <button 
                                                type="button" 
                                                onClick={() => setFormStep(3)}
                                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] rounded-[24px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                Siguiente Paso
                                                <ArrowRight size={18} strokeWidth={3} />
                                            </button>
                                            <button type="button" onClick={() => setFormStep(1)} className="w-full text-center text-[10px] font-bold text-text-muted hover:text-text-main uppercase tracking-widest transition-colors py-2">
                                                <span className="mr-2">←</span> Volver a Datos
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid lg:grid-cols-[1fr_380px] gap-12 h-full items-start"
                                >
                                    <div className="space-y-10">
                                        {/* Header and Mode Selector */}
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Protocolo Final</p>
                                                <h3 className="text-3xl font-black text-text-main tracking-tight uppercase">Definir Agenda</h3>
                                            </div>

                                            <div className="flex p-1 bg-black/[0.03] dark:bg-white/5 rounded-2xl border border-border-main self-start md:self-auto">
                                                <button 
                                                    type="button"
                                                    onClick={() => setAgendaMode('custom')}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${agendaMode === 'custom' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-text-muted hover:text-text-main'}`}
                                                >
                                                    Personalizado
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setAgendaMode('existing')}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${agendaMode === 'existing' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-text-muted hover:text-text-main'}`}
                                                >
                                                    Unirse a Grupo
                                                </button>
                                            </div>
                                        </div>

                                        {agendaMode === 'existing' ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between border-b border-border-main pb-4">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Seleccionar horario existente</p>
                                                    <div className="relative w-48">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Buscar grupo o especialidad..."
                                                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-emerald-50"
                                                            value={groupSearchTerm}
                                                            onChange={(e) => setGroupSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto custom-scrollbar p-1">
                                                    {existingSchedules
                                                        .filter(s => {
                                                            const students = s.students || (s.student ? [s.student] : []);
                                                            const groupNames = students.map((st: any) => st?.name || '').join(' ').toLowerCase();
                                                            const service = (students[0]?.service_name || '').toLowerCase();
                                                            const DAYS_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                                            const day = DAYS_MAP[s.dayOfWeek === 7 ? 0 : s.dayOfWeek].toLowerCase();
                                                            const search = groupSearchTerm.toLowerCase();
                                                            return groupNames.includes(search) || service.includes(search) || day.includes(search);
                                                        })
                                                        .map((s, idx) => {
                                                            const isSelected = formSchedules.some(fs => fs.dayOfWeek === s.dayOfWeek && fs.startTime === s.startTime);
                                                            const participants = s.students || (s.student ? [s.student] : []);
                                                            const service = participants[0]?.service_name || "General";
                                                            
                                                            return (
                                                                <button 
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormSchedules([{ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }]);
                                                                        if (participants[0]) {
                                                                            setFormData(prev => ({ ...prev, service_name: service }));
                                                                        }
                                                                    }}
                                                                    className={`flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all text-left group ${isSelected ? 'border-emerald-500 bg-emerald-500/5' : 'border-border-main bg-surface dark:bg-bg-soft hover:border-emerald-500/30'}`}
                                                                >
                                                                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 text-black' : 'bg-black/5 dark:bg-white/5 text-text-muted'}`}>
                                                                        <span className="text-[9px] font-black leading-none mb-0.5">{['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][s.dayOfWeek === 7 ? 0 : s.dayOfWeek].substring(0,3).toUpperCase()}</span>
                                                                        <span className="text-sm font-black leading-none">{s.startTime.split(':')[0]}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-black uppercase tracking-tight truncate">{service}</span>
                                                                            <span className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[8px] font-black text-text-muted">{participants.length} / {s.capacity || 10}</span>
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-text-muted truncate mt-0.5">
                                                                            {s.startTime} a {s.endTime}
                                                                        </p>
                                                                    </div>
                                                                    {isSelected && <Check size={18} className="text-emerald-500" />}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-10">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                            <Calendar size={14} /> Cronograma Semanal
                                                        </p>
                                                        <h4 className="text-3xl font-black text-text-main uppercase tracking-tight">Elegir Días</h4>
                                                    </div>

                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const newFlex = !formData.isFlexible;
                                                            setFormData(prev => ({ ...prev, isFlexible: newFlex }));
                                                            if (newFlex) setFormSchedules([]);
                                                        }}
                                                        className={`flex items-center gap-3 px-5 py-2.5 rounded-[14px] border transition-all ${formData.isFlexible ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-surface dark:bg-[#161618] border-border-main text-text-muted hover:border-emerald-500/30'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${formData.isFlexible ? 'bg-emerald-500' : 'bg-border-main'}`} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Horario Flexible</span>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                                    {DAY_ORDER.map(day => {
                                                        const active = formSchedules.some(s => s.dayOfWeek === day);
                                                        const schedule = formSchedules.find(s => s.dayOfWeek === day);
                                                        
                                                        return (
                                                            <div 
                                                                key={day}
                                                                onClick={() => !formData.isFlexible && toggleDay(day)}
                                                                className={`relative h-44 rounded-[28px] p-5 border transition-all duration-500 flex flex-col cursor-pointer group overflow-hidden ${
                                                                    active 
                                                                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                                                                    : 'bg-zinc-50 dark:bg-black/20 border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5'
                                                                } ${formData.isFlexible ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                                                            >
                                                                {/* Day label + indicator dot */}
                                                                <div className="flex items-start justify-between mb-4 relative z-10">
                                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                                                        active ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-emerald-50 transition-colors'
                                                                    }`}>
                                                                        {DAY_SHORT[day]}
                                                                    </span>
                                                                    <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 transition-all duration-500 ${active ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-200 dark:bg-white/10'}`} />
                                                                </div>

                                                                {/* Background glow for active */}
                                                                {active && (
                                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
                                                                )}

                                                                {/* Content Area */}
                                                                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                                                    {active && schedule ? (
                                                                        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500" onClick={e => e.stopPropagation()}>
                                                                            <div className="text-2xl font-black text-zinc-900 dark:text-emerald-50 font-mono tracking-tighter flex items-center">
                                                                                <div className="flex flex-col items-center">
                                                                                    <button type="button" onClick={() => adjustDayTime(day, 'h', 1)} className="p-1 opacity-0 group-hover:opacity-100 transition-all hover:text-emerald-500 -mb-1"><ChevronUp size={14} strokeWidth={3} /></button>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        className="w-8 text-center bg-transparent outline-none focus:text-emerald-500 transition-colors" 
                                                                                        value={schedule.startTime.split(':')[0]} 
                                                                                        onChange={(e) => {
                                                                                            const v = e.target.value.replace(/\D/g, '');
                                                                                            if (v.length <= 2 && Number(v) < 24) {
                                                                                                updateDayTime(day, `${v.padStart(2, '0')}:${schedule.startTime.split(':')[1]}`);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <button type="button" onClick={() => adjustDayTime(day, 'h', -1)} className="p-1 opacity-0 group-hover:opacity-100 transition-all hover:text-emerald-500 -mt-1"><ChevronDown size={14} strokeWidth={3} /></button>
                                                                                </div>
                                                                                <span className="text-zinc-300 dark:text-zinc-600 mb-1">:</span>
                                                                                <div className="flex flex-col items-center">
                                                                                    <button type="button" onClick={() => adjustDayTime(day, 'm', 30)} className="p-1 opacity-0 group-hover:opacity-100 transition-all hover:text-emerald-500 -mb-1"><ChevronUp size={14} strokeWidth={3} /></button>
                                                                                    <input 
                                                                                        type="text" 
                                                                                        className="w-8 text-center bg-transparent outline-none focus:text-emerald-500 transition-colors" 
                                                                                        value={schedule.startTime.split(':')[1]} 
                                                                                        onChange={(e) => {
                                                                                            const v = e.target.value.replace(/\D/g, '');
                                                                                            if (v.length <= 2 && Number(v) < 60) {
                                                                                                updateDayTime(day, `${schedule.startTime.split(':')[0]}:${v.padStart(2, '0')}`);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <button type="button" onClick={() => adjustDayTime(day, 'm', -30)} className="p-1 opacity-0 group-hover:opacity-100 transition-all hover:text-emerald-500 -mt-1"><ChevronDown size={14} strokeWidth={3} /></button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-2 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                                                                            <div className="w-10 h-10 rounded-2xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center">
                                                                                <Plus size={20} className="text-zinc-400 group-hover:text-emerald-500" />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sidebar Finalización (Paso 3) */}
                                    <div className="bg-surface dark:bg-[#111113] border border-border-main p-8 rounded-[2.5rem] shadow-sm space-y-8 sticky top-0 overflow-hidden group">
                                        
                                        <div className="space-y-6">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Resumen Final</p>
                                            <div className="space-y-4">
                                                <SummaryItemComp icon={<Calendar size={14} />} label="Actividad" value={formData.service_name} highlight />
                                                <SummaryItemComp icon={<Clock size={14} />} label="Clases" value={formData.isFlexible ? 'Flexible' : `${formSchedules.length} p/ sem`} />
                                                <SummaryItemComp icon={<DollarSign size={14} />} label="Total Plan" value={`${user?.currency || '$'}${calculateAmount().toLocaleString('es-AR')}`} highlight />
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-4">
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[11px] rounded-[24px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                                            >
                                                {loading ? 'Sincronizando...' : (student ? 'Guardar Cambios' : 'Completar Registro')}
                                            </button>
                                            <button type="button" onClick={() => setFormStep(2)} className="w-full text-center text-[10px] font-bold text-text-muted hover:text-text-main uppercase tracking-widest transition-colors py-2">
                                                <span className="mr-2">←</span> Revisar Liquidación
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* Sub-modal Overlay for New Service - Refactored Emerald */}
                <AnimatePresence>
                    {showServicePopup && (
                        <div className="absolute inset-0 z-[3000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-[#0c0c0e] w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-white italic tracking-tight">NUEVA ACTIVIDAD</h3>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocolo de Alta</p>
                                    </div>
                                    <button onClick={() => setShowServicePopup(false)} className="p-2 hover:bg-white/5 rounded-full transition-all text-zinc-600">
                                        <Zap size={18} />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <InputFieldComp 
                                        label="Nombre de Actividad" 
                                        icon={<LayoutGrid size={14} />} 
                                        value={newServiceData.name} 
                                        onChange={(e: any) => setNewServiceData({ ...newServiceData, name: e.target.value })} 
                                        placeholder="Ej: Yoga, Crossfit..."
                                    />
                                    <InputFieldComp 
                                        label="Precio Sugerido" 
                                        icon={<DollarSign size={14} />} 
                                        type="number"
                                        value={newServiceData.price} 
                                        onChange={(e: any) => setNewServiceData({ ...newServiceData, price: Number(e.target.value) })} 
                                        placeholder="0"
                                    />
                                    
                                    <button 
                                        type="button"
                                        disabled={isSavingService}
                                        onClick={handleCreateService}
                                        className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 italic"
                                    >
                                        {isSavingService ? 'Procesando...' : <><Plus size={16} /> Crear Protocolo</>}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default StudentFormModal;
