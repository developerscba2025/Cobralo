import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { api, type Student, type UserService } from '../../services/api';
import { showToast } from '../Toast';

// Sub-steps
import IdentityStep from './form/IdentityStep';
import LiquidationStep from './form/LiquidationStep';
import AgendaStep from './form/AgendaStep';
import type { BusinessPaymentAccount } from '../../services/api';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: Student | null;
    user: any;
    userServices: UserService[];
    refreshServices: () => Promise<void>;
}

const StepDot = ({ n, current, label }: { n: number; current: number; label: string }) => {
    const done = current > n;
    const active = current === n;
    return (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-700 ${done ? 'bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.4)] scale-110' : active ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'bg-white/5 text-text-muted/30 border border-white/5'}`}>
                {done ? <Check size={14} strokeWidth={4} /> : n}
            </div>
            <span className={`hidden lg:block text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-700 ${active ? 'text-text-main translate-x-1' : done ? 'text-emerald-500/60' : 'text-text-muted/20'}`}>{label}</span>
        </div>
    );
};

const StudentFormModal: React.FC<StudentFormModalProps> = ({
    isOpen, onClose, onSuccess, student, user, userServices, refreshServices
}) => {
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '', phone: '', service_name: '',
        price_per_hour: 0, classes_per_month: 4,
        payment_method: 'Efectivo', deadline_day: 10,
        planType: 'MONTHLY', credits: 0, sub_category: '',
        billing_alias: '', class_duration_min: 60, isFlexible: false
    });

    const [configType, setConfigType] = useState<'weeks' | 'pack' | 'unique' | 'unlimited'>('weeks');
    const [weeklyFrequency, setWeeklyFrequency] = useState(1);
    const [showServicePopup, setShowServicePopup] = useState(false);
    const [newServiceData, setNewServiceData] = useState({ name: '', price: 0 });
    const [isSavingService, setIsSavingService] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formSchedules, setFormSchedules] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);
    const [existingSchedules, setExistingSchedules] = useState<any[]>([]);
    const [agendaMode, setAgendaMode] = useState<'custom' | 'existing'>('custom');
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [paymentAccounts, setPaymentAccounts] = useState<BusinessPaymentAccount[]>([]);

    useEffect(() => {
        const loadAllSchedules = async () => {
            try {
                const data = await api.getAllSchedules();
                setExistingSchedules(data);
            } catch (err) {
                console.error('Error fetching schedules', err);
            }
        };
        const loadPaymentAccounts = async () => {
            try {
                const data = await api.getPaymentAccounts();
                setPaymentAccounts(data);
            } catch (err) {
                console.error('Error fetching payment accounts', err);
            }
        };
        if (isOpen) {
            loadAllSchedules();
            loadPaymentAccounts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name, phone: student.phone,
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
            if (student.planType === 'PER_CLASS') setConfigType('unique');
            else if (student.planType === 'PACK') setConfigType('pack');
            else if (student.planType === 'UNLIMITED') setConfigType('unlimited');
            else setConfigType('weeks');
            setWeeklyFrequency(Math.max(1, Math.round((student.classes_per_month || 4) / 4)));
            setFormSchedules(student.schedules?.map(s => ({
                dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime
            })) || []);
        } else {
            setFormData({
                name: '', phone: '', service_name: '',
                price_per_hour: 0, classes_per_month: 4,
                payment_method: 'Efectivo', deadline_day: 10,
                planType: 'MONTHLY', credits: 0, sub_category: '',
                billing_alias: user?.bizAlias || '', class_duration_min: 60, isFlexible: false
            });
            setFormSchedules([]);
            setConfigType('weeks');
            setAgendaMode('custom');
            setGroupSearchTerm('');
        }
        setFormStep(1);
    }, [student, user, isOpen]);

    const calculateAmount = () => {
        const pph = Number(formData.price_per_hour) || 0;
        const ratio = (Number(formData.class_duration_min) || 60) / 60;
        if (configType === 'unique') return Math.round(pph * ratio);
        if (configType === 'unlimited') return Math.round(pph); // For unlimited, pph acts as the flat monthly fee
        if (configType === 'weeks') return Math.round(pph * ratio * weeklyFrequency * 4);
        return Math.round(pph * ratio * (formData.classes_per_month || 0)); // pack
    };

    const handleSubmit = async (e: any) => {
        if (e) e.preventDefault();
        if (formData.phone && !formData.phone.trim().startsWith('+')) {
            showToast.error('El teléfono debe incluir el prefijo de país (+54...)');
            return;
        }
        const amount = calculateAmount();
        const payload: any = {
            ...formData, amount,
            planType: configType === 'unique' ? 'PER_CLASS' : (configType === 'pack' ? 'PACK' : configType === 'unlimited' ? 'UNLIMITED' : 'MONTHLY'),
            classes_per_month: configType === 'weeks' ? weeklyFrequency * 4 : (configType === 'unlimited' ? 999 : formData.classes_per_month),
            class_duration_min: formData.class_duration_min || 60,
            deadline_day: (configType === 'unique' || configType === 'pack') ? 0 : (formData.deadline_day ? Number(formData.deadline_day) : 10),
            due_day: (configType === 'unique' || configType === 'pack') ? 0 : (formData.deadline_day ? Number(formData.deadline_day) : 10),
            schedules: formSchedules
        };
        setLoading(true);
        try {
            if (student) {
                await api.updateStudent(student.id, payload);
                showToast.success('Alumno actualizado');
            } else {
                await api.createStudent(payload);
                showToast.success('¡Alumno registrado con éxito! 🚀');
            }
            onSuccess();
        } catch {
            showToast.error(student ? 'Error al actualizar' : 'Error al crear alumno');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async () => {
        if (!newServiceData.name) return showToast.error('Ingresá un nombre');
        setIsSavingService(true);
        try {
            const created = await api.createService({ name: newServiceData.name, defaultPrice: Number(newServiceData.price) });
            await refreshServices();
            setFormData(prev => ({ ...prev, service_name: created.name, price_per_hour: Number(created.defaultPrice) }));
            setShowServicePopup(false);
            setNewServiceData({ name: '', price: 0 });
            showToast.success('Actividad creada');
        } catch {
            showToast.error('Error al crear actividad');
        } finally {
            setIsSavingService(false);
        }
    };

    if (!isOpen) return null;

    const cur = user?.currency || '$';
    const amt = calculateAmount();

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 modal-overlay"
            />

            <motion.div
                className="relative w-full max-w-[1440px] h-[90vh] md:h-[85vh] flex flex-col rounded-[32px] md:rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden glass-premium mx-auto"
            >
                {/* ── Header ── */}
                <div className="shrink-0 px-8 md:px-10 py-4 border-b border-white/5 flex items-center justify-between gap-6 bg-surface/30 dark:bg-surface/85 backdrop-blur-3xl">
                    <div className="flex items-center gap-10">
                        <div>
                            <h2 className="text-2xl font-black text-text-main tracking-tight uppercase leading-none">
                                {student ? 'Perfil del Alumno' : 'Nuevo Registro'}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.2em]">
                                    {student ? 'Modificación de parámetros' : 'Alta de nuevo integrante'}
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <div className="h-10 w-px bg-white/5" />
                            <StepDot n={1} current={formStep} label="Identidad" />
                            <div className={`h-px w-10 transition-all duration-700 ${formStep > 1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`} />
                            <StepDot n={2} current={formStep} label="Liquidación" />
                            <div className={`h-px w-10 transition-all duration-700 ${formStep > 2 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/5'}`} />
                            <StepDot n={3} current={formStep} label="Agenda" />
                        </div>
                    </div>

                    <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-text-muted hover:text-text-main transition-all active:scale-90 border border-transparent hover:border-white/5">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-hidden">
                    <form onSubmit={handleSubmit} className="h-full">
                        <AnimatePresence mode="wait">
                            {formStep === 1 && (
                                <IdentityStep
                                    formData={formData}
                                    setFormData={setFormData}
                                    userServices={userServices}
                                    setShowServicePopup={setShowServicePopup}
                                    onNext={() => setFormStep(2)}
                                    currency={cur}
                                    calculateAmount={calculateAmount}
                                />
                            )}
                            {formStep === 2 && (
                                <LiquidationStep
                                    formData={formData}
                                    setFormData={setFormData}
                                    configType={configType}
                                    setConfigType={setConfigType}
                                    weeklyFrequency={weeklyFrequency}
                                    setWeeklyFrequency={setWeeklyFrequency}
                                    calculateAmount={calculateAmount}
                                    onNext={() => setFormStep(3)}
                                    onBack={() => setFormStep(1)}
                                    currency={cur}
                                    paymentAccounts={paymentAccounts}
                                />
                            )}
                            {formStep === 3 && (
                                <AgendaStep
                                    formData={formData}
                                    setFormData={setFormData}
                                    agendaMode={agendaMode}
                                    setAgendaMode={setAgendaMode}
                                    groupSearchTerm={groupSearchTerm}
                                    setGroupSearchTerm={setGroupSearchTerm}
                                    existingSchedules={existingSchedules}
                                    formSchedules={formSchedules}
                                    setFormSchedules={setFormSchedules}
                                    configType={configType}
                                    weeklyFrequency={weeklyFrequency}
                                    user={user}
                                    onBack={() => setFormStep(2)}
                                    onSubmit={handleSubmit}
                                    loading={loading}
                                    student={student}
                                    cur={cur}
                                    amt={amt}
                                />
                            )}
                        </AnimatePresence>
                    </form>
                </div>
            </motion.div>

            {/* ── Sub-modal: Nueva Actividad ── */}
            <AnimatePresence>
                {showServicePopup && (
                    <div className="absolute inset-0 z-[3000] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowServicePopup(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-[40px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-bg-app w-full max-w-sm rounded-[40px] p-10 shadow-2xl border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Protocolo</p>
                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Nueva Actividad</h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Zap size={22} fill="currentColor" className="opacity-80" />
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest ml-1">Nombre</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/[0.03] border border-white/5 focus:border-emerald-500/40 rounded-2xl px-6 py-4 text-white font-bold text-base outline-none transition-all placeholder:text-zinc-600"
                                        value={newServiceData.name}
                                        onChange={(e: any) => setNewServiceData({ ...newServiceData, name: e.target.value })}
                                        placeholder="Ej: Yoga, Piano, Gym..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest ml-1">Valor Sugerido</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-lg">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white/[0.03] border border-white/5 focus:border-emerald-500/40 rounded-2xl px-6 py-4 pl-12 text-white font-black text-2xl outline-none transition-all placeholder:text-zinc-700"
                                            value={newServiceData.price || ''}
                                            onChange={(e: any) => setNewServiceData({ ...newServiceData, price: Number(e.target.value) })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 space-y-3">
                                    <button
                                        type="button"
                                        disabled={isSavingService}
                                        onClick={handleCreateService}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs py-5 rounded-[22px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSavingService ? 'Creando...' : 'Crear Actividad'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowServicePopup(false)}
                                        className="w-full text-center text-[10px] font-black text-text-muted/40 hover:text-white uppercase tracking-widest transition-colors py-2"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentFormModal;
