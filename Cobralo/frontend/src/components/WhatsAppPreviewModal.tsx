import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageCircle, AlertCircle } from 'lucide-react';
import { showToast } from './Toast';

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
}

interface WhatsAppPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    user: any;
    isPro: boolean;
    customTemplate?: string;
}

const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({ isOpen, onClose, students, user, isPro, customTemplate }) => {
    const defaultTemplate = customTemplate || `Hola {alumno}! Te saluda {negocio}. Te recuerdo el pago de {servicio} por {moneda}{monto}. Mi alias es: {alias}`;
    const template = customTemplate || (isPro ? (user?.reminderTemplate || defaultTemplate) : defaultTemplate);

    const [isSending, setIsSending] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Reset state when opened
    React.useEffect(() => {
        if (isOpen) {
            setIsSending(false);
            setCurrentIndex(0);
        }
    }, [isOpen]);

    const handleStartSending = () => {
        setIsSending(true);
        setCurrentIndex(0);
    };

    const handleSendNext = () => {
        if (currentIndex >= students.length) return;
        
        const s = students[currentIndex];
        const alias = s.billing_alias || user?.bizAlias || 'Alias';
        const amount = Number(s.amount) || 0;
        const serviceName = (s.service_name === 'General' && s.sub_category) ? s.sub_category : (s.service_name || '');
        
        const message = template
            .replace(/{alumno}/g, s.name || '')
            .replace(/{monto}/g, amount.toLocaleString('es-AR'))
            .replace(/{negocio}/g, user?.bizName || 'Tu Profe')
            .replace(/{servicio}/g, serviceName)
            .replace(/{subcategoria}/g, s.sub_category || '')
            .replace(/{metodo}/g, s.payment_method || '')
            .replace(/{vencimiento}/g, (s.deadline_day || '').toString())
            .replace(/{alias}/g, alias)
            .replace(/{moneda}/g, user?.currency || '$');
            
        const cleanPhone = s.phone ? s.phone.replace(/\D/g, '') : '';
        const url = cleanPhone 
            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            
        window.open(url, '_blank');
        
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        
        if (nextIndex >= students.length) {
            showToast.success('Todos los mensajes procesados');
            onClose();
        }
    };

    const getPreviewMessage = (student: Student) => {
        const alias = student.billing_alias || user?.bizAlias || 'Alias';
        const amount = Number(student.amount) || 0;
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        
        return template
            .replace(/{alumno}/g, student.name || '')
            .replace(/{monto}/g, amount.toLocaleString('es-AR'))
            .replace(/{negocio}/g, user?.bizName || 'Tu Profe')
            .replace(/{servicio}/g, serviceName)
            .replace(/{subcategoria}/g, student.sub_category || '')
            .replace(/{metodo}/g, student.payment_method || '')
            .replace(/{vencimiento}/g, (student.deadline_day || '').toString())
            .replace(/{alias}/g, alias)
            .replace(/{moneda}/g, user?.currency || '$');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-bg-dark rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100 dark:border-border-emerald"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-bg-soft/20">
                            <div>
                                <h3 className="text-xl font-black text-text-main uppercase tracking-tight flex items-center gap-3">
                                    <MessageCircle className="text-primary-main" /> Enviar Mensajes ({students.length})
                                </h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Revisá el contenido antes de enviar</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                <X size={20} className="text-text-muted" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                            {!isSending ? (
                                <>
                                    <div className="p-4 bg-primary-main/5 dark:bg-primary-main/10 border border-primary-main/20 rounded-2xl flex gap-4">
                                        <AlertCircle className="text-primary-main shrink-0" size={20} />
                                        <p className="text-xs font-bold text-primary-main leading-relaxed">
                                            Recomendamos enviar los mensajes paso a paso para evitar que el navegador bloquee las ventanas emergentes.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Vista previa de mensajes</p>
                                        {students.map((student) => (
                                            <div key={student.id} className="p-5 bg-zinc-50 dark:bg-bg-soft/40 rounded-2xl border border-zinc-100 dark:border-white/5 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-main/10 flex items-center justify-center">
                                                        <User size={16} className="text-primary-main" />
                                                    </div>
                                                    <span className="font-bold text-text-main text-sm uppercase tracking-tight">{student.name}</span>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-bg-dark rounded-xl border border-zinc-100 dark:border-white/5 shadow-inner">
                                                    <p className="text-xs text-text-muted leading-relaxed italic">
                                                        "{getPreviewMessage(student)}"
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-8 min-h-[300px] flex flex-col justify-center items-center">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-white/5" />
                                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * currentIndex) / students.length} className="text-primary-main transition-all duration-500 ease-in-out" />
                                        </svg>
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-text-main tabular-nums leading-none mb-1">{currentIndex}</p>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-[#a1a1aa] dark:text-[#a1a1aa]">de {students.length}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center space-y-2">
                                        <p className="text-lg font-black text-text-main">
                                            Siguiente: <span className="text-primary-main">{students[currentIndex]?.name}</span>
                                        </p>
                                        <p className="text-sm font-bold text-text-muted">
                                            Haz clic para abrir WhatsApp
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-bg-soft/20 flex gap-4">
                            <button
                                onClick={() => isSending ? setIsSending(false) : onClose()}
                                className="flex-1 py-4 bg-white dark:bg-bg-dark text-text-muted font-bold rounded-2xl border border-zinc-100 dark:border-white/5 hover:bg-zinc-100 transition-all uppercase tracking-widest text-[10px]"
                            >
                                Atrás
                            </button>
                            
                            {!isSending ? (
                                <button
                                    onClick={handleStartSending}
                                    className="flex-2 flex-[2] py-4 bg-primary-main text-white font-black rounded-2xl shadow-xl shadow-primary-glow hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    <Send size={18} /> Iniciar Envío
                                </button>
                            ) : (
                                <button
                                    onClick={handleSendNext}
                                    className="flex-2 flex-[2] py-4 bg-primary-main text-white font-black rounded-2xl shadow-xl shadow-primary-glow hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    <MessageCircle size={18} /> Enviar Mensaje a {students[currentIndex]?.name}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WhatsAppPreviewModal;
