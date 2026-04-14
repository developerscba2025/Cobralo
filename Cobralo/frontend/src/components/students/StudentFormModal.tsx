import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CreditCard, Calendar, Check, Plus, Minus, ArrowRight, ArrowLeft, Target, Wallet, Clock, Sparkles, MessageCircle, Banknote } from 'lucide-react';
import { api, type Student, type UserService, type BusinessPaymentAccount } from '../../services/api';
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
    const [paymentAccounts, setPaymentAccounts] = useState<BusinessPaymentAccount[]>([]);
    const [showManualAlias, setShowManualAlias] = useState(false);

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
            setWeeklyFrequency(1);
        }
        setFormStep(1);
        
        // Fetch payment accounts
        const fetchAccounts = async () => {
            try {
                const accounts = await api.getPaymentAccounts();
                setPaymentAccounts(accounts);
                
                // If not editing and have a default account, pre-set it if empty
                if (!student && !formData.billing_alias) {
                    const def = accounts.find(a => a.isDefault);
                    if (def) setFormData(prev => ({ ...prev, billing_alias: def.alias }));
                }
            } catch (err) {
                console.error("Error fetching accounts:", err);
            }
        };
        fetchAccounts();
    }, [student, user, isOpen]); // Removido userServices para evitar que el form se limpie al añadir una actividad

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

    const steps = [
        { id: 1, label: 'Identidad', icon: User },
        { id: 2, label: 'Plan', icon: CreditCard },
        { id: 3, label: 'Agenda', icon: Calendar }
    ];

    const isStep1Complete = formData.name && formData.phone && formData.service_name;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-0 md:p-6 backdrop-blur-xl">
            <motion.div 
                layoutId="student-modal"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-white dark:bg-bg-dark w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] flex flex-col md:rounded-[3rem] shadow-2xl relative border border-border-main overflow-hidden"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute right-6 top-6 z-10 p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                    <X size={20} className="text-text-muted" />
                </button>

                {/* Header / Stepper Container */}
                <div className="p-6 md:p-8 border-b border-border-main bg-zinc-50/50 dark:bg-bg-soft/10">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase italic">
                                {student ? 'Editar Alumno' : 'Nuevo Alumno'}
                            </h2>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mt-0.5 opacity-60">Configuración Premium</p>
                        </div>
                        
                        {/* Stepper Logic */}
                        <div className="flex items-center gap-4">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.id}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                                            formStep >= s.id 
                                            ? 'bg-primary-main text-white shadow-primary-glow' 
                                            : 'bg-zinc-100 dark:bg-white/5 text-text-muted'
                                        }`}>
                                            <s.icon size={18} />
                                        </div>
                                        <span className={`hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] ${
                                            formStep >= s.id ? 'text-text-main' : 'text-text-muted opacity-40'
                                        }`}>{s.label}</span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`h-px w-8 md:w-12 transition-all duration-500 ${
                                            formStep > s.id ? 'bg-primary-main' : 'bg-border-main'
                                        }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="h-full">
                        <AnimatePresence mode="wait">
                            {formStep === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block">Nombre del Alumno</label>
                                                <div className="relative group">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><User size={20} /></div>
                                                    <input required type="text" className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all placeholder:text-text-muted/30 italic" placeholder="Nombre completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block">Número de WhatsApp</label>
                                                <div className="relative group">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><MessageCircle size={20} /></div>
                                                    <input required type="tel" className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all placeholder:text-text-muted/30 italic" placeholder="Ej: 1122334455" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block">Servicio / Actividad</label>
                                                <div className="relative group">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><Plus size={20} /></div>
                                                    <select 
                                                        required
                                                        className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all appearance-none italic" 
                                                        value={formData.service_name} 
                                                        onChange={e => {
                                                            const sName = e.target.value;
                                                            if (sName === 'ADD_NEW') {
                                                                setShowServicePopup(true);
                                                                return;
                                                            }
                                                            const selectedService = userServices.find(s => s.name === sName);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                service_name: sName,
                                                                price_per_hour: selectedService ? Number(selectedService.defaultPrice) : prev.price_per_hour
                                                            }));
                                                        }}
                                                    >
                                                        <option value="" disabled>Seleccioná actividad</option>
                                                        {userServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                                        <option value="ADD_NEW" className="text-primary-main font-bold">➕ Agregar Nueva Actividad...</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block">Categoría (Opcional)</label>
                                                <div className="relative group">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><Target size={20} /></div>
                                                    <input type="text" className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all placeholder:text-text-muted/30 italic" placeholder="Nombre de categoría" value={formData.sub_category || ''} onChange={e => setFormData({ ...formData, sub_category: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Step 1 */}
                                    <div className="pt-6 border-t border-border-main flex justify-end">
                                        <button 
                                            type="button" 
                                            disabled={!isStep1Complete}
                                            onClick={() => setFormStep(2)} 
                                            className="px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 italic flex items-center gap-3"
                                        >
                                            Sig. Paso <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex flex-col lg:flex-row gap-12">
                                        {/* Plan Builder Left */}
                                        <div className="flex-1 space-y-10">
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4 opacity-60">Seleccioná cómo vas a medir el cobro</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'weeks', label: 'POR SEMANAS', desc: '1, 2 O 3 VECES X SEM.', icon: Calendar },
                                                        { id: 'month', label: 'POR MES', desc: 'TOTAL CLASES FIJAS', icon: CreditCard },
                                                        { id: 'unique', label: 'CLASE ÚNICA', desc: 'PAGO POR VEZ', icon: Target }
                                                    ].map(t => (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() => setConfigType(t.id as any)}
                                                            className={`p-5 rounded-[1.5rem] border-2 transition-all text-left flex flex-col gap-2 group relative overflow-hidden ${
                                                                configType === t.id
                                                                ? 'border-primary-main bg-primary-main/10 shadow-xl shadow-primary-main/5'
                                                                : 'border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-bg-dark hover:border-border-main'
                                                            }`}
                                                        >
                                                            {configType === t.id && (
                                                                <div className="absolute top-0 right-0 p-3 text-primary-main"><Check size={16} /></div>
                                                            )}
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${configType === t.id ? 'bg-primary-main text-white' : 'bg-white dark:bg-white/5 text-text-muted'}`}>
                                                                <t.icon size={20} />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <span className="text-[10px] font-black text-text-main uppercase tracking-tight">{t.label}</span>
                                                                <p className="text-[8px] font-bold text-text-muted leading-tight uppercase opacity-60">{t.desc}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dynamic Inputs Based on Choice */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                {configType === 'weeks' && (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 opacity-60">Frecuencia Semanal</label>
                                                        <div className="flex items-center gap-4 bg-zinc-100 dark:bg-white/5 p-3 rounded-[2rem] border border-border-main">
                                                            <button type="button" onClick={() => setWeeklyFrequency(prev => Math.max(1, prev - 1))} className="w-12 h-12 rounded-2xl bg-white dark:bg-bg-dark border border-border-main flex items-center justify-center text-text-main hover:bg-primary-main hover:text-white transition-all"><Minus size={18} /></button>
                                                            <div className="flex-1 text-center">
                                                                <span className="text-xl font-black text-text-main uppercase italic">{weeklyFrequency} veces</span>
                                                            </div>
                                                            <button type="button" onClick={() => setWeeklyFrequency(prev => prev + 1)} className="w-12 h-12 rounded-2xl bg-white dark:bg-bg-dark border border-border-main flex items-center justify-center text-text-main hover:bg-primary-main hover:text-white transition-all"><Plus size={18} /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {configType === 'month' && (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 opacity-60">Total Clases al Mes</label>
                                                        <div className="relative group">
                                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><Sparkles size={18} /></div>
                                                            <input type="number" className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all italic" placeholder="Cantidad de clases" value={formData.classes_per_month} onChange={e => setFormData({ ...formData, classes_per_month: Number(e.target.value) })} />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block opacity-60">Precio x Hora Base</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted font-black group-focus-within:text-primary-main transition-colors text-lg">{user?.currency || '$'}</div>
                                                        <input required type="number" className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all italic" placeholder="Importe total" value={formData.price_per_hour || ''} onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block opacity-60">Duración Clase</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><Clock size={18} /></div>
                                                        <select className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner appearance-none italic" value={formData.class_duration_min} onChange={e => setFormData({ ...formData, class_duration_min: Number(e.target.value) })}>
                                                            <option value={30}>30 min</option>
                                                            <option value={45}>45 min</option>
                                                            <option value={60}>1 hora</option>
                                                            <option value={90}>1.5 hs</option>
                                                            <option value={120}>2 hs</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block opacity-60">Método de Pago</label>
                                                        <div className="relative group">
                                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><Wallet size={18} /></div>
                                                            <select className="w-full pl-16 pr-8 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border-none outline-none font-bold text-base shadow-inner appearance-none italic" value={formData.payment_method} onChange={e => {
                                                                const method = e.target.value;
                                                                let alias = '';
                                                                if (method === 'Transferencia') {
                                                                    const def = paymentAccounts.find(a => a.isDefault) || paymentAccounts[0];
                                                                    if (def) alias = def.alias;
                                                                }
                                                                setFormData({ ...formData, payment_method: method, billing_alias: alias });
                                                                setShowManualAlias(false);
                                                            }}>
                                                                <option value="Efectivo">Efectivo 💵</option>
                                                                <option value="Transferencia">Transferencia 🏦</option>
                                                                <option value="Mercado Pago">Mercado Pago 🔵</option>
                                                                <option value="Otro">Otro 💳</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    {formData.payment_method === 'Transferencia' && (
                                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                                            {paymentAccounts.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 px-2">
                                                                    {paymentAccounts.map(acc => (
                                                                        <button
                                                                            key={acc.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, billing_alias: acc.alias });
                                                                                setShowManualAlias(false);
                                                                            }}
                                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                                                formData.billing_alias === acc.alias && !showManualAlias
                                                                                ? 'bg-primary-main text-white border-primary-main shadow-lg shadow-primary-main/20 scale-105'
                                                                                : 'bg-zinc-100 dark:bg-white/5 text-text-muted border-transparent hover:border-text-muted/20'
                                                                            }`}
                                                                        >
                                                                            {acc.name}
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowManualAlias(true)}
                                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                                            showManualAlias
                                                                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white scale-105 shadow-xl'
                                                                            : 'bg-zinc-100 dark:bg-white/5 text-text-muted border-transparent hover:border-text-muted/20'
                                                                        }`}
                                                                    >
                                                                        + Personalizado
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {(paymentAccounts.length === 0 || showManualAlias) && (
                                                                <div className="relative group animate-in slide-in-from-top-2 duration-300">
                                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-main transition-colors"><Banknote size={16} /></div>
                                                                    <input 
                                                                        type="text" 
                                                                        className="w-full pl-16 pr-8 py-4 bg-primary-main/5 dark:bg-bg-dark dark:text-white rounded-[1.5rem] border border-primary-main/20 outline-none font-bold text-sm shadow-inner focus:ring-4 focus:ring-primary-main/10 transition-all placeholder:text-text-muted/30 italic" 
                                                                        placeholder="Alias de transferencia" 
                                                                        value={formData.billing_alias || ''} 
                                                                        onChange={e => setFormData({ ...formData, billing_alias: e.target.value })} 
                                                                    />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                {/* Action items removed from here and moved to fixed footer */}
                                            </div>
                                        </div>

                                        {/* Ticket Builder Real-Time */}
                                        <div className="w-full lg:w-[280px] shrink-0">
                                            <div className="bg-zinc-900 dark:bg-bg-soft/40 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden border border-white/5 space-y-4">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                                
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Total a Cobrar</p>
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-xl font-bold mb-2 text-primary-main tracking-tighter">{user?.currency || '$'}</span>
                                                        <span className="text-5xl font-black tracking-tighter italic">
                                                            {calculateAmount().toLocaleString('es-AR')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-white/5" />

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                                                        <span className="text-white/40">Frecuencia:</span>
                                                        <span className="text-white">{configType === 'unique' ? 'Única' : (configType === 'weeks' ? 'Semanal' : 'Mensual')}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                                                        <span className="text-white/40">Cant Clase:</span>
                                                        <span className="text-white">{configType === 'unique' ? '1' : (configType === 'weeks' ? weeklyFrequency * 4 : formData.classes_per_month)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                                                        <span className="text-white/40">Estado:</span>
                                                        <span className="text-primary-main italic">PENDIENTE</span>
                                                    </div>
                                                    {formData.payment_method === 'Transferencia' && formData.billing_alias && (
                                                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                                                            <span className="text-white/40">Alias:</span>
                                                            <span className="text-white truncate max-w-[120px]">{formData.billing_alias}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-2">
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-primary-main/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Monto Sugerido por Clase</p>
                                                        <p className="text-sm font-black text-primary-main italic relative z-10">{user?.currency || '$'} {Math.round(Number(formData.price_per_hour || 0) * (Number(formData.class_duration_min || 60) / 60)).toLocaleString('es-AR')}</p>
                                                        <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] mt-2 relative z-10">Método: {formData.payment_method}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Step 2 */}
                                    <div className="mt-10 flex justify-end gap-4">
                                        <button type="button" onClick={() => setFormStep(1)} className="flex items-center gap-2 text-text-muted font-black uppercase tracking-widest text-[10px] hover:text-text-main transition-colors">
                                            <ArrowLeft size={16} /> Volver
                                        </button>
                                        <button type="button" onClick={() => setFormStep(3)} className="px-12 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 italic">
                                            Config. Agenda <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {formStep === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="flex flex-col lg:flex-row gap-12">
                                        <div className="flex-1 space-y-10">
                                            <div onClick={() => {
                                                const newFlex = !formData.isFlexible;
                                                setFormData(prev => ({ ...prev, isFlexible: newFlex }));
                                                if (newFlex) setFormSchedules([]);
                                            }} className={`group p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden ${
                                                formData.isFlexible 
                                                ? 'border-primary-main bg-primary-main/10' 
                                                : 'border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-bg-dark opacity-100'
                                            }`}>
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl transition-all ${formData.isFlexible ? 'bg-primary-main text-white' : 'bg-zinc-200 dark:bg-white/5 text-text-muted'}`}>
                                                        🚀
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-black text-text-main uppercase italic">Horario Flexible / Sin Día Fijo</p>
                                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">El alumno coordina sus turnos cada semana</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <div className={`w-8 h-8 rounded-full border-4 transition-all ${formData.isFlexible ? 'bg-primary-main border-primary-main/20' : 'border-zinc-200 dark:border-white/10'}`} />
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {!formData.isFlexible && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }} 
                                                        animate={{ opacity: 1, height: 'auto' }} 
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="flex flex-wrap gap-2">
                                                            {formSchedules.map((schedule, i) => (
                                                                <div key={i} className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-bg-dark rounded-[1.5rem] border border-border-main scroll-mt-20">
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <select 
                                                                            className="bg-transparent border-none text-xs font-black outline-none tracking-widest uppercase cursor-pointer italic"
                                                                            value={schedule.dayOfWeek}
                                                                            onChange={e => {
                                                                                const newArr = [...formSchedules];
                                                                                newArr[i].dayOfWeek = Number(e.target.value);
                                                                                setFormSchedules(newArr);
                                                                            }}
                                                                        >
                                                                            <option value={1}>Lunes</option>
                                                                            <option value={2}>Martes</option>
                                                                            <option value={3}>Miércoles</option>
                                                                            <option value={4}>Jueves</option>
                                                                            <option value={5}>Viernes</option>
                                                                            <option value={6}>Sábado</option>
                                                                            <option value={0}>Domingo</option>
                                                                        </select>
                                                                        <button onClick={() => setFormSchedules(prev => prev.filter((_, idx) => idx !== i))} className="p-1 hover:text-red-500 transition-colors"><X size={14} /></button>
                                                                    </div>
                                                                    <div className="relative group">
                                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-main opacity-50"><Clock size={14} /></div>
                                                                        <input 
                                                                            type="time" 
                                                                            className="bg-zinc-100 dark:bg-black/20 pl-9 pr-4 py-2 rounded-xl border-none outline-none font-black text-primary-main italic w-full [color-scheme:dark] cursor-pointer"
                                                                            value={schedule.startTime}
                                                                            onChange={e => {
                                                                                const newRef = [...formSchedules];
                                                                                newRef[i].startTime = e.target.value;
                                                                                setFormSchedules(newRef);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setFormSchedules(prev => [...prev, { dayOfWeek: 1, startTime: '18:00', endTime: '19:00' }])}
                                                                className="w-32 h-[92px] rounded-[1.5rem] border-2 border-dashed border-zinc-200 dark:border-white/5 flex flex-col items-center justify-center gap-1 text-text-muted hover:border-primary-main hover:text-primary-main hover:bg-primary-main/5 transition-all"
                                                            >
                                                                <Plus size={18} />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Agregar</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Action Step 3 (Final) */}
                                    <div className="mt-10 flex items-center justify-between gap-4">
                                        <button type="button" onClick={() => setFormStep(2)} className="flex items-center gap-2 text-text-muted font-black uppercase tracking-widest text-[10px] hover:text-text-main transition-colors">
                                            <ArrowLeft size={16} /> Volver
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="px-12 py-4 bg-primary-main text-white font-black uppercase tracking-[0.2em] text-xs rounded-[1.5rem] shadow-xl shadow-primary-main/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 italic"
                                        >
                                            {loading ? 'Guardando...' : student ? 'Actualizar Alumno' : 'Finalizar Registro'}
                                            {!loading && (student ? <Check size={18} /> : <Sparkles size={18} />)}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* Sub-modal Overlay for New Service */}
                <AnimatePresence>
                    {showServicePopup && (
                        <div className="absolute inset-0 z-[3000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-bg-soft w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-border-main"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-text-main italic tracking-tight">NUEVA ACTIVIDAD</h3>
                                    <button onClick={() => setShowServicePopup(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all">
                                        <X size={20} className="text-text-muted" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block">Nombre de Actividad</label>
                                        <input 
                                            autoFocus
                                            type="text" 
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner italic" 
                                            placeholder="Nombre de actividad" 
                                            value={newServiceData.name}
                                            onChange={e => setNewServiceData({ ...newServiceData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-4 mb-2 block">Precio Sugerido (Opcional)</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                                            <input 
                                                type="number" 
                                                className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner italic" 
                                                placeholder="0" 
                                                value={newServiceData.price || ''}
                                                onChange={e => setNewServiceData({ ...newServiceData, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        disabled={isSavingService}
                                        onClick={handleCreateService}
                                        className="w-full bg-primary-main text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl shadow-primary-glow flex items-center justify-center gap-2 hover:scale-105 transition-all"
                                    >
                                        {isSavingService ? 'Guardando...' : <><Plus size={16} /> Crear Actividad</>}
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
