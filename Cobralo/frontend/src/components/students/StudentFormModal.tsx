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
        class_duration_min: 60,
        isFlexible: false
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
                class_duration_min: student.class_duration_min || 60,
                isFlexible: student.schedules?.length === 0
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
                class_duration_min: 60,
                isFlexible: false
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
                                            <select 
                                                className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm" 
                                                value={formData.service_name} 
                                                onChange={e => {
                                                    const sName = e.target.value;
                                                    const selectedService = userServices.find(s => s.name === sName);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        service_name: sName,
                                                        price_per_hour: selectedService ? Number(selectedService.defaultPrice) : prev.price_per_hour
                                                    }));
                                                }}
                                            >
                                                <option value="" disabled>Elegí un servicio</option>
                                                {userServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                                {userServices.length === 0 && <option value="General">General</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Subcategoría</label>
                                            <input type="text" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" value={formData.sub_category || ''} onChange={e => setFormData({ ...formData, sub_category: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-bg-dark rounded-2xl border border-zinc-100 dark:border-border-emerald/30 group cursor-pointer hover:border-primary-main/30 transition-all mt-4" onClick={() => setFormData(prev => ({ ...prev, isFlexible: !prev.isFlexible }))}>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.isFlexible ? 'bg-primary-main border-primary-main text-white' : 'border-zinc-300'}`}>
                                            {formData.isFlexible && <Check size={14} strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-700 dark:text-emerald-50">Sin horario fijo (Flexible)</p>
                                            <p className="text-[10px] font-medium text-zinc-400">Viene días distintos cada semana o sobre la marcha</p>
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
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Paso {formData.isFlexible ? 2 : 2}: Plan y Costos</h3>
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
                                            <input required type="number" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" value={formData.planType === 'PACK' ? (formData.credits || '') : (formData.classes_per_month || '')} onChange={e => (formData.planType === 'PACK' || formData.planType === 'PER_CLASS') ? setFormData({ ...formData, credits: Number(e.target.value) }) : setFormData({ ...formData, classes_per_month: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Duración</label>
                                            <select 
                                                className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" 
                                                value={formData.class_duration_min || 60} 
                                                onChange={e => setFormData({ ...formData, class_duration_min: Number(e.target.value) })}
                                            >
                                                <option value={30}>30 min</option>
                                                <option value={45}>45 min</option>
                                                <option value={60}>1 hora</option>
                                                <option value={90}>1.5 hs</option>
                                                <option value={120}>2 hs</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Precio x Hora</label>
                                        <input required type="number" className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none font-bold text-sm shadow-inner" value={formData.price_per_hour || ''} onChange={e => setFormData({ ...formData, price_per_hour: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1 ml-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Vencimiento</label>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData({ ...formData, deadline_day: formData.deadline_day === 0 ? 10 : 0 })}
                                                    className={`text-[9px] font-black px-2 py-0.5 rounded-lg border transition-all ${formData.deadline_day === 0 ? 'bg-primary-main/10 border-primary-main text-primary-main' : 'border-zinc-200 text-zinc-400'}`}
                                                >
                                                    {formData.deadline_day === 0 ? 'SIN VENCIMIENTO' : '+ PONER FECHA'}
                                                </button>
                                            </div>
                                            {formData.deadline_day !== 0 ? (
                                                <input 
                                                    type="number" 
                                                    className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none font-bold shadow-inner" 
                                                    placeholder="Día (1-28)"
                                                    value={formData.deadline_day} 
                                                    onChange={e => setFormData({...formData, deadline_day: Number(e.target.value) })} 
                                                />
                                            ) : (
                                                <div className="w-full p-4 bg-zinc-50 dark:bg-bg-dark rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">No vence</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">Método</label>
                                            <select 
                                                className="w-full p-4 bg-zinc-50 dark:bg-bg-dark rounded-2xl border-none font-bold text-sm" 
                                                value={formData.payment_method} 
                                                onChange={e => {
                                                    const newMethod = e.target.value;
                                                    setFormData({ 
                                                        ...formData, 
                                                        payment_method: newMethod,
                                                        billing_alias: '' // Siempre resetear al cambiar de método para evitar "stickiness"
                                                    });
                                                }}
                                            >
                                                <option value="Efectivo">Efectivo 💵</option>
                                                <option value="Transferencia">Transferencia 🏦</option>
                                                <option value="Mercado Pago">Mercado Pago 🔵</option>
                                                <option value="Otro">Otro 💳</option>
                                            </select>
                                        </div>
                                    </div>

                                    {(formData.payment_method === 'Transferencia' || formData.payment_method === 'Mercado Pago') && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block">
                                                    {formData.payment_method === 'Mercado Pago' ? (user?.mpAccessToken ? 'Configuración Mercado Pago' : 'Elegí tu cuenta de Mercado Pago (Manual)') : '¿Dónde debe transferir?'}
                                                </label>
                                                
                                                {/* Case 1: Mercado Pago Integrated */}
                                                {formData.payment_method === 'Mercado Pago' && (
                                                    user?.mpAccessToken ? (
                                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                                <Check size={16} strokeWidth={3} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Integración MP Activa</p>
                                                                <p className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/60">Se generarán links de pago automáticos.</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-5 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl text-center space-y-3">
                                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Requiere Configuración</p>
                                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-4">Vinculá tu cuenta de Mercado Pago en Ajustes para automatizar los cobros.</p>
                                                        </div>
                                                    )
                                                )}

                                                {/* Case 2: Transferencia (Manual Alias Selector) */}
                                                {formData.payment_method === 'Transferencia' && (
                                                    user?.paymentAccounts && user.paymentAccounts.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {user.paymentAccounts.map((acc: any) => (
                                                                <button
                                                                    key={acc.id}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, billing_alias: acc.alias })}
                                                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.billing_alias === acc.alias ? 'border-primary-main bg-primary-main/5' : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-bg-dark'}`}
                                                                >
                                                                    <div className="flex flex-col items-start">
                                                                        <span className="text-[10px] font-black uppercase tracking-wider">{acc.name}</span>
                                                                        <span className="text-xs font-bold text-text-muted">{acc.alias}</span>
                                                                    </div>
                                                                    {formData.billing_alias === acc.alias && <Check className="text-primary-main" size={16} />}
                                                                </button>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, billing_alias: '' })}
                                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all ${!user.paymentAccounts.some((a:any) => a.alias === formData.billing_alias) && formData.billing_alias ? 'border-primary-main bg-primary-main/5' : 'border-zinc-200 dark:border-zinc-800'}`}
                                                            >
                                                                <span className="text-[10px] font-black uppercase tracking-wider">Otro Alias / Manual</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type="text" 
                                                            placeholder="Ingresá Alias o CBU"
                                                            className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" 
                                                            value={formData.billing_alias || ''} 
                                                            onChange={e => setFormData({ ...formData, billing_alias: e.target.value })} 
                                                        />
                                                    )
                                                )}

                                                {/* Manual input if they select "Other" or explicitly want to type an alias despite having integration (optional logic) */}
                                                {((formData.payment_method === 'Transferencia' || (formData.payment_method === 'Mercado Pago' && !user?.mpAccessToken)) && (!user?.paymentAccounts?.some((a: any) => a.alias === formData.billing_alias) && formData.billing_alias !== '')) && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Alias personalizado..." 
                                                            className="w-full p-4 bg-zinc-50 dark:bg-bg-dark dark:text-white rounded-2xl border-none outline-none font-bold text-sm shadow-inner" 
                                                            value={formData.billing_alias || ''} 
                                                            onChange={e => setFormData({ ...formData, billing_alias: e.target.value })} 
                                                        />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
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
