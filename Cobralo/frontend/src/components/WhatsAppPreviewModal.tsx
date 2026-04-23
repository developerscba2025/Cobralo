import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Send, MessageCircle, ChevronRight, FileText, 
    Sparkles, CheckCheck, Users, ChevronLeft, Zap
} from 'lucide-react';
import { showToast } from './Toast';
import Portal from './Portal';
import { api } from '../services/api';

interface Student {
    id: number;
    name: string;
    phone?: string;
    service_name?: string;
    sub_category?: string | null;
    amount?: number | string;
    payment_method?: string;
    deadline_day?: number | null;
    billing_alias?: string | null;
    status?: 'paid' | 'pending' | 'paused';
    createdAt?: string;
}

type MessagingGoal = 'WELCOME' | 'PAYMENT' | 'GENERAL';

interface WhatsAppPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    user: any;
    isPro: boolean;
    initialGoal?: MessagingGoal;
    customTemplate?: string;
    preselectedStudents?: Student[];
}

const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({ 
    isOpen, onClose, students = [], user, isPro, initialGoal, customTemplate, preselectedStudents 
}) => {
    const [step, setStep] = React.useState<1 | 2 | 3>(1);
    const [goal, setGoal] = React.useState<MessagingGoal>(initialGoal || 'GENERAL');
    const [selectedStudentIds, setSelectedStudentIds] = React.useState<number[]>([]);
    
    const predefinedTemplates = React.useMemo(() => [
        {
            id: 'PAYMENT',
            name: 'Cobros',
            icon: FileText,
            text: user?.reminderTemplate ?? "*RECORDATORIO DE PAGO*\n\n{saludo} {nombre}, te escribo de *{negocio}* para recordarte tu pago de *{servicio}* correspondiente a {mes}.\n\nMonto: *{monto}*\n\nPara abonar de forma rápida y segura, podés ingresar al siguiente link:\n{pago_url}\n\nAvisame cualquier cosa. Gracias!"
        },
        {
            id: 'WELCOME',
            name: 'Bienvenida',
            icon: Sparkles,
            text: user?.welcomeTemplate ?? "*¡BIENVENIDO/A!*\n\n¡Hola {nombre}! Te damos la bienvenida oficial a *{negocio}*. ¡Qué alegría que te sumes!\n\nEstamos muy felices de que empieces tus clases de *{servicio}*. Queremos asegurarnos de que tengas la mejor experiencia posible con nosotros.\n\nCualquier duda que tengas, podés escribirme por acá. ¡Nos vemos muy pronto!"
        },
        {
            id: 'GENERAL',
            name: 'Aviso General',
            icon: MessageCircle,
            text: user?.generalTemplate ?? "*AVISO IMPORTANTE*\n\n{saludo} *{nombre}*, te escribimos de *{negocio}* para informarte:\n\n{mensaje}\n\nCualquier duda quedamos a tu entera disposición. ¡Saludos!"
        }
    ], [user]);

    const [templateText, setTemplateText] = React.useState('');
    const [customMessage, setCustomMessage] = React.useState(''); // Only for GENERAL mode
    const [isSending, setIsSending] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [selectedAccountId, setSelectedAccountId] = React.useState<number | 'default'>('default');
    const [isEditing, setIsEditing] = React.useState(false);

    // Filter students based on goal
    const filteredStudentsByGoal = React.useMemo(() => {
        if (goal === 'PAYMENT') return students.filter(s => s.status === 'pending');
        if (goal === 'WELCOME') {
            // New students = created in the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return students.filter(s => s.createdAt ? new Date(s.createdAt) > sevenDaysAgo : true);
        }
        return students;
    }, [students, goal]);

    React.useEffect(() => {
        if (isOpen) {
            setStep(initialGoal ? 2 : 1);
            setGoal(initialGoal || 'GENERAL');
            setIsSending(false);
            setCurrentIndex(0);
            
            const defaultAcc = user?.paymentAccounts?.find((a: any) => (a as any).isDefault);
            setSelectedAccountId(defaultAcc?.id || 'default');

            const currentGoal = initialGoal || 'GENERAL';
            const template = predefinedTemplates.find(t => t.id === currentGoal)?.text || '';
            setTemplateText(customTemplate || template.replace(/[\uFFFD]/g, ''));
            setIsEditing(currentGoal === 'GENERAL' || !!customTemplate);
            setCustomMessage(''); // reset custom message on open
            
            // Selection priority: preselectedStudents > initialGoal filtering > all students
            if (preselectedStudents && preselectedStudents.length > 0) {
                setSelectedStudentIds(preselectedStudents.map(s => s.id));
            } else {
                const filtered = initialGoal === 'PAYMENT' ? students.filter(s => s.status === 'pending') : 
                               initialGoal === 'WELCOME' ? students.filter(s => s.createdAt && (new Date().getTime() - new Date(s.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000) :
                               students;
                setSelectedStudentIds(filtered.map(s => s.id));
            }
        }
    }, [isOpen, initialGoal, students, predefinedTemplates, customTemplate, user?.paymentAccounts, preselectedStudents]);

    const activeStudents = React.useMemo(() => 
        students.filter(s => selectedStudentIds.includes(s.id)),
    [students, selectedStudentIds]);

    const getActiveAlias = () => {
        if (selectedAccountId === 'default') return user?.bizAlias || 'Alias';
        const account = user?.paymentAccounts?.find((a: any) => a.id === selectedAccountId);
        return account?.alias || user?.bizAlias || 'Alias';
    };

    const buildMessage = (student: Student, text: string) => {
        if (!student) return text;
        const activeAlias = getActiveAlias();
        const alias = student.billing_alias || activeAlias;
        const amountNum = Number(student.amount) || 0;
        const currency = user?.currency || '$';
        const formattedAmount = `${currency}${amountNum.toLocaleString('es-AR')}`;
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        const hour = new Date().getHours();
        const saludo = hour < 12 ? 'Buenos dias' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        const mesActual = meses[new Date().getMonth()];
        const nombrePila = student.name ? student.name.split(' ')[0] : '';
        const appBaseUrl = import.meta.env.VITE_APP_URL || 'https://cobralo.info';
        const pagoUrl = `${appBaseUrl}/pago/${student.id}`;
        const sanitize = (val: string) => (val || '').toString().normalize('NFC').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();

        const replaceVar = (text: string, varName: string, value: string) => {
            const regex = new RegExp(`{\\s*${varName}\\s*}`, 'gi');
            return text.replace(regex, value);
        };

        let result = text;
        result = replaceVar(result, 'alumno', sanitize(student.name));
        result = replaceVar(result, 'nombre', sanitize(nombrePila));
        result = replaceVar(result, 'nombre_pila', sanitize(nombrePila));
        result = replaceVar(result, 'monto', formattedAmount);
        result = replaceVar(result, 'servicio', sanitize(serviceName));
        result = replaceVar(result, 'negocio', sanitize(user?.bizName || 'Tu Profe'));
        result = replaceVar(result, 'pago_url', pagoUrl);
        result = replaceVar(result, 'vencimiento', (student.deadline_day || '').toString());
        result = replaceVar(result, 'mes', mesActual);
        result = replaceVar(result, 'saludo', saludo);
        result = replaceVar(result, 'alias', sanitize(alias));

        return result.normalize('NFC').trim();
    };

    const openWhatsApp = (student: Student, text: string) => {
        let message = buildMessage(student, effectiveTemplate);
        message = message.normalize('NFC').replace(/[\uFFFD]/g, '');
        const cleanPhone = student.phone ? student.phone.replace(/\D/g, '') : '';
        const encodedText = encodeURIComponent(message);
        const url = cleanPhone
            ? `https://wa.me/${cleanPhone}?text=${encodedText}`
            : `https://api.whatsapp.com/send?text=${encodedText}`;
        window.open(url, '_blank');
    };



    const handleSendNext = () => {
        if (currentIndex >= activeStudents.length) return;
        const s = activeStudents[currentIndex];
        openWhatsApp(s, effectiveTemplate);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= activeStudents.length) {
            showToast.success(`¡Envío finalizado!`);
            onClose();
        }
    };

    // For GENERAL mode: inject customMessage into {mensaje} placeholder; otherwise use raw templateText
    const effectiveTemplate = React.useMemo(() => {
        if (goal === 'GENERAL') {
            return templateText.replace(/{mensaje}/g, customMessage || '_[ tu aviso aquí ]_');
        }
        return templateText;
    }, [goal, templateText, customMessage]);

    const livePreviewHtml = React.useMemo(() => {
        const student = activeStudents[0] || students[0];
        const raw = student ? buildMessage(student, effectiveTemplate) : effectiveTemplate;
        return raw.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/\*(.*?)\*/g, '<strong class="font-extrabold text-white">$1</strong>')
                  .replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>')
                  .replace(/[\uFFFD]/g, '');
    }, [activeStudents, students, effectiveTemplate, user]);

    const handleGoalSelection = (selectedGoal: MessagingGoal) => {
        setGoal(selectedGoal);
        const template = predefinedTemplates.find(t => t.id === selectedGoal)?.text || '';
        setTemplateText(template.replace(/[\uFFFD]/g, ''));
        setIsEditing(selectedGoal === 'GENERAL');
        
        // Update selection based on new goal
        const filtered = selectedGoal === 'PAYMENT' ? students.filter(s => s.status === 'pending') : 
                       selectedGoal === 'WELCOME' ? students.filter(s => s.createdAt && (new Date().getTime() - new Date(s.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000) :
                       students;
        setSelectedStudentIds(filtered.map(s => s.id));
        setStep(2);
    };

    const renderStep1 = () => (
        <div className="p-8 space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">¿Qué deseás comunicar?</h3>
                <p className="text-sm text-text-muted font-medium">Seleccioná un objetivo para personalizar el envío</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { id: 'PAYMENT' as const, title: 'Cobros', desc: 'Recordatorios de cuotas pendientes', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { id: 'WELCOME' as const, title: 'Bienvenida', desc: 'Mensaje para alumnos nuevos', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { id: 'GENERAL' as const, title: 'Aviso General', desc: 'Comunica novedades o cambios', icon: MessageCircle, color: 'text-sky-500', bg: 'bg-sky-500/10' }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => handleGoalSelection(opt.id)}
                        className="flex items-center gap-5 p-5 glass-premium border border-border-main rounded-[24px] hover:border-emerald-500/50 transition-all text-left group"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${opt.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                            <opt.icon size={24} className={opt.color} />
                        </div>
                        <div>
                            <p className="font-black text-text-main uppercase tracking-tight">{opt.title}</p>
                            <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
                        </div>
                        <ChevronRight size={20} className="ml-auto text-border-main group-hover:text-text-main transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="px-8 pt-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tight">Destinatarios</h3>
                    <button 
                        onClick={() => setSelectedStudentIds(selectedStudentIds.length === filteredStudentsByGoal.length ? [] : filteredStudentsByGoal.map(s => s.id))}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-400"
                    >
                        {selectedStudentIds.length === filteredStudentsByGoal.length ? 'Desmarcar todos' : 'Marcar todos'}
                    </button>
                </div>
                <p className="text-xs text-text-muted mb-6">
                    {goal === 'PAYMENT' ? 'Mostrando alumnos con cuotas pendientes.' : 
                     goal === 'WELCOME' ? 'Mostrando alumnos registrados recientemente.' : 
                     'Seleccioná los alumnos para este aviso.'}
                </p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 space-y-2 custom-scrollbar pb-8">
                {filteredStudentsByGoal.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                        <Users size={32} className="mb-4 text-text-muted" />
                        <p className="text-xs font-bold uppercase tracking-widest">No se encontraron alumnos</p>
                        <p className="text-[10px] mt-1">Probá cambiando el objetivo o agregando alumnos.</p>
                    </div>
                ) : filteredStudentsByGoal.map(s => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    return (
                        <button
                            key={s.id}
                            onClick={() => setSelectedStudentIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-transparent border-transparent opacity-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-emerald-500 text-black' : 'bg-bg-app text-text-muted'}`}>
                                    {s.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-bold ${isSelected ? 'text-text-main' : 'text-text-muted'}`}>{s.name}</p>
                                    <p className="text-[10px] uppercase font-black text-text-muted/60 tracking-widest">{s.service_name || 'General'}</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-border-main'}`}>
                                {isSelected && <CheckCheck size={12} strokeWidth={3} />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="px-8 pt-8 shrink-0 mb-6">
                <h3 className="text-xl font-black text-text-main uppercase tracking-tight">
                    {goal === 'GENERAL' ? '¿Qué querés comunicar?' : 'Mensaje y Vista Previa'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                    {goal === 'GENERAL'
                        ? 'Escribí el aviso. El saludo y los datos del alumno se agregan solos.'
                        : 'Editá el texto o revisá la previsualización antes de enviar.'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0 px-8 pb-8 space-y-6">
                {goal === 'GENERAL' ? (
                    /* GENERAL mode: only a clean textarea for the custom content */
                    <>
                        <textarea
                            value={customMessage}
                            onChange={e => setCustomMessage(e.target.value)}
                            autoFocus
                            className="w-full h-44 p-5 glass-premium border border-border-main rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium leading-relaxed resize-none placeholder:text-text-muted/40"
                            placeholder="Ej: A partir del lunes cambiamos el horario de clase a las 10hs..."
                        />

                        {/* WhatsApp-style locked preview */}
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Vista previa del mensaje</p>
                            <div className="bg-bg-app/60 rounded-3xl px-4 py-6 relative">
                                <div className="absolute inset-0 opacity-[0.03] rounded-3xl" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                                <div className="flex justify-end">
                                    <div className="bg-[#dcf8c6] dark:bg-[#054740] border border-black/5 dark:border-white/5 rounded-[20px] rounded-tr-none px-4 pt-3 pb-2 shadow-xl max-w-[90%]">
                                        <p
                                            className="text-zinc-800 dark:text-white text-sm leading-relaxed font-medium whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                                        />
                                        <div className="flex justify-end items-center gap-1 mt-1.5 opacity-60">
                                            <span className="text-[10px] font-bold">14:20</span>
                                            <CheckCheck size={13} className="text-[#34b7f1]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* PAYMENT / WELCOME mode: full template editor + preview toggle */
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Plantilla del mensaje</p>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isEditing ? 'bg-emerald-500 text-black' : 'bg-white/5 text-text-muted border border-border-main'
                                }`}
                            >
                                {isEditing ? 'Ver Previsualización' : 'Editar Texto'}
                            </button>
                        </div>

                        {isEditing ? (
                            <>
                                <textarea
                                    value={templateText}
                                    onChange={e => setTemplateText(e.target.value)}
                                    className="w-full h-52 p-5 glass-premium border border-border-main rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium leading-relaxed resize-none"
                                    placeholder="Escribí tu mensaje aquí..."
                                />
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Variables Dinámicas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Nombre', tag: '{nombre}' },
                                            { label: 'Nombre Pila', tag: '{nombre_pila}' },
                                            { label: 'Monto', tag: '{monto}' },
                                            { label: 'Servicio', tag: '{servicio}' },
                                            { label: 'Vencimiento', tag: '{vencimiento}' },
                                            { label: 'Negocio', tag: '{negocio}' }
                                        ].map(v => (
                                            <button
                                                key={v.tag}
                                                onClick={() => setTemplateText(prev => prev + ' ' + v.tag)}
                                                className="px-3 py-1.5 bg-white/5 border border-border-main rounded-xl text-[10px] font-bold text-text-muted hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                                            >
                                                {v.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-bg-app/50 rounded-3xl px-4 py-6 relative min-h-[200px]">
                                <div className="absolute inset-0 opacity-[0.03] rounded-3xl" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                                <div className="flex justify-end">
                                    <div className="bg-[#dcf8c6] dark:bg-[#054740] border border-black/5 dark:border-white/5 rounded-[24px] rounded-tr-none px-5 pt-4 pb-2 shadow-xl max-w-[85%]">
                                        <p
                                            className="text-zinc-800 dark:text-white text-sm leading-relaxed font-medium whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                                        />
                                        <div className="flex justify-end items-center gap-1.5 mt-2 opacity-60">
                                            <span className="text-[10px] font-bold">14:20</span>
                                            <CheckCheck size={14} className="text-[#34b7f1]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center p-0 md:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 modal-overlay"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="relative w-full max-w-xl bg-surface h-full md:h-auto md:max-h-[90vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-border-main flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    {step > 1 && (
                                        <button 
                                            onClick={() => {
                                                setStep((step - 1) as any);
                                                setIsSending(false);
                                            }}
                                            className="p-2 hover:bg-bg-app rounded-xl transition-all"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <div>
                                        <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Asistente de Mensajes</h2>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Paso {step} de 3</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-bg-app rounded-xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Main Content */}
                            {!isSending ? (
                                <>
                                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                        {step === 1 && renderStep1()}
                                        {step === 2 && renderStep2()}
                                        {step === 3 && renderStep3()}
                                    </div>

                                    {/* Footer */}
                                    <div className="px-8 py-6 border-t border-border-main flex gap-4 shrink-0 bg-surface">
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        {step === 2 && (
                                            <button
                                                onClick={() => setStep(3)}
                                                disabled={selectedStudentIds.length === 0}
                                                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest disabled:opacity-30"
                                            >
                                                Siguiente <ChevronRight size={16} strokeWidth={3} />
                                            </button>
                                        )}
                                        {step === 3 && (
                                            <div className="flex-1 flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setIsSending(true);
                                                        setCurrentIndex(0);
                                                    }}
                                                    disabled={selectedStudentIds.length === 0 || !effectiveTemplate.trim() || (goal === 'GENERAL' && !customMessage.trim())}
                                                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest disabled:opacity-30"
                                                >
                                                    <Send size={16} strokeWidth={3} />
                                                    Iniciar Envío ({activeStudents.length})
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Sending Step */
                                <div className="p-12 flex flex-col items-center justify-center text-center space-y-10">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse scale-110" />
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-black/5 dark:text-white/5" />
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * currentIndex) / activeStudents.length} className="text-emerald-500 transition-all duration-1000 ease-in-out" />
                                        </svg>
                                        <div className="text-center relative z-10">
                                            <p className="text-6xl font-black text-text-main tracking-tighter tabular-nums">{currentIndex}</p>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mt-1">de {activeStudents.length}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-3xl font-black text-text-main tracking-tight uppercase">{activeStudents[currentIndex]?.name}</h4>
                                        <p className="text-xs text-text-muted font-medium max-w-xs">
                                            Presioná el botón para abrir el chat de WhatsApp y enviar el mensaje.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full max-w-xs">
                                        <button
                                            onClick={handleSendNext}
                                            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest"
                                        >
                                            Enviar a {activeStudents[currentIndex]?.name?.split(' ')[0]} <Send size={16} strokeWidth={3} />
                                        </button>
                                        <button
                                            onClick={() => setIsSending(false)}
                                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-red-500 transition-colors"
                                        >
                                            Cancelar Envío
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default WhatsAppPreviewModal;
