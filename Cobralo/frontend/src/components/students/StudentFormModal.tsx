import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';
import { api, type Student, type UserService } from '../../services/api';
import { showToast } from '../Toast';

interface StudentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: Student | null;
    user: any;
    userServices: UserService[];
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ 
    isOpen, onClose, onSuccess, student, user, userServices 
}) => {
    const [formStep, setFormStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        phone: '',
        service_name: 'General',
        price_per_hour: 0,
        classes_per_month: 4,
        payment_method: 'Efectivo',
        deadline_day: 10,
        planType: 'MONTHLY',
        credits: 0,
        sub_category: '',
        billing_alias: '',
        class_duration_min: 60
    });
    const [formSchedules, setFormSchedules] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);

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
                class_duration_min: student.class_duration_min || 60
            });
            setFormSchedules(student.schedules?.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime
            })) || []);
        } else {
            const firstService = userServices.length > 0 ? userServices[0] : null;
            setFormData({
                name: '', 
                phone: '', 
                service_name: firstService ? firstService.name : (user?.defaultService || 'General'),
                price_per_hour: firstService ? Number(firstService.defaultPrice) : (Number(user?.defaultPrice) || 0), 
                classes_per_month: 4,
                payment_method: 'Efectivo', 
                deadline_day: 10, 
                planType: 'MONTHLY', 
                credits: 0,
                sub_category: '',
                billing_alias: user?.bizAlias || '',
                class_duration_min: 60
            });
            setFormSchedules([]);
        }
        setFormStep(1);
    }, [student, user, userServices, isOpen]);

    const calculateAmount = (pph: number, classes: number, duration: number = 60) => {
        const pricePerMin = pph / 60;
        return Math.round(pricePerMin * duration * classes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = (formData.planType === 'PACK' || formData.planType === 'PER_CLASS')
            ? calculateAmount(formData.price_per_hour || 0, 1, formData.class_duration_min) * (formData.credits || 0)
            : calculateAmount(formData.price_per_hour || 0, formData.classes_per_month || 0, formData.class_duration_min);

        const payload: any = {
            ...formData,
            amount,
            class_duration_min: formData.class_duration_min || 60,
            deadline_day: formData.deadline_day ? Number(formData.deadline_day) : 10,
            due_day: formData.deadline_day ? Number(formData.deadline_day) : 10,
            schedules: formSchedules
        };

        try {
            if (student) {
                await api.updateStudent(student.id, payload);
                showToast.success('Alumno actualizado');
            } else {
                await api.createStudent(payload);
                showToast.success('Alumno creado');
            }
            onSuccess();
        } catch {
            showToast.error(student ? 'Error al actualizar' : 'Error al crear alumno');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-bg-soft w-full max-w-md rounded-[32px] p-5 sm:p-10 shadow-2xl relative border border-zinc-100 dark:border-border-emerald max-height-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute right-6 top-6 text-zinc-300 hover:text-zinc-600 dark:hover:text-white transition">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6">{student ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {formStep === 1 ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-primary-main/10 dark:bg-primary-main/20 flex items-center justify-center text-primary-main"><Plus size={16} /></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Paso 1: Datos Personales</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Nombre Completo</label>
                                        <input required type="text" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">WhatsApp</label>
                                        <input required type="tel" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Servicio</label>
                                            <select className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm" value={formData.service_name} onChange={e => setFormData({ ...prev => ({...prev, service_name: e.target.value })})}>
                                                {userServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                                {userServices.length === 0 && <option value="General">General</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Subcategoría</label>
                                            <input type="text" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" value={formData.sub_category || ''} onChange={e => setFormData({ ...formData, sub_category: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <button type="button" onClick={() => (formData.name && formData.phone) ? setFormStep(2) : showToast.error('Completá nombre y teléfono')} className="w-full bg-primary-main text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl shadow-xl">Siguiente Paso</button>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-main/10 dark:bg-primary-main/20 flex items-center justify-center text-primary-main"><Check size={16} /></div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Paso 2: Plan y Costos</h3>
                                    </div>
                                    <button type="button" onClick={() => setFormStep(1)} className="text-[10px] font-bold text-primary-main uppercase tracking-widest hover:underline">Atrás</button>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-zinc-50 dark:bg-bg-dark p-2 rounded-2xl flex gap-1">
                                        {['MONTHLY', 'PACK', 'PER_CLASS'].map(p => (
                                            <button key={p} type="button" onClick={() => setFormData({ ...formData, planType: p as any })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${formData.planType === p ? 'bg-white dark:bg-bg-soft text-primary-main shadow-md' : 'text-zinc-400'}`}>
                                                {p === 'MONTHLY' ? 'Mensual' : p === 'PACK' ? 'Pack' : 'Clases'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Cantidad</label>
                                            <input required type="number" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm" value={formData.planType === 'PACK' ? (formData.credits || '') : (formData.classes_per_month || '')} onChange={e => (formData.planType === 'PACK' || formData.planType === 'PER_CLASS') ? setFormData({ ...formData, credits: Number(e.target.value) }) : setFormData({ ...formData, classes_per_month: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Precio x Hora</label>
                                            <input required type="number" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none font-bold text-sm" value={formData.price_per_hour || ''} onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Vencimiento</label>
                                            <input type="number" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none" value={formData.deadline_day} onChange={e => setFormData({...formData, deadline_day: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Método</label>
                                            <select className="w-full p-4 bg-zinc-50 dark:bg-bg-dark rounded-2xl border-none font-bold text-sm" value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })}>
                                                <option value="Efectivo">Efectivo 💵</option>
                                                <option value="Transferencia">Transferencia 🏦</option>
                                                <option value="Otro">Otro 💳</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div className="bg-primary-main p-6 rounded-[28px] text-white shadow-xl relative overflow-hidden">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Cálculo de Cuota</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-xl font-bold mb-1 opacity-80">{user?.currency || '$'}</span>
                                    <span className="text-4xl font-black tracking-tighter">
                                        {(formData.planType === 'PACK'
                                            ? calculateAmount(formData.price_per_hour || 0, 1, formData.class_duration_min || 60) * (formData.credits || 0)
                                            : calculateAmount(formData.price_per_hour || 0, formData.classes_per_month || 0, formData.class_duration_min || 60)
                                        ).toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <button type="submit" className="w-full bg-white text-primary-main font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl mt-6">Confirmar</button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default StudentFormModal;
