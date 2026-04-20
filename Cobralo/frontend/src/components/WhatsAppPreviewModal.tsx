import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, ChevronRight, FileText, Sparkles, CheckCheck } from 'lucide-react';
import { showToast } from './Toast';

import Portal from './Portal';

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

const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({ isOpen, onClose, students = [], user, isPro }) => {
    const predefinedTemplates = React.useMemo(() => [
        {
            id: 'billing',
            name: 'Recordatorio de Pago',
            icon: FileText,
            text: user?.reminderTemplate ?? `{saludo} {nombre_pila}! \uD83D\uDC4B\n\nTe escribo de *{negocio}* para recordarte que ya pod\u00E9s realizar el pago de *{servicio}* de {mes_actual}. \uD83D\uDCDD\n\n\uD83D\uDCB0 *Monto:* {moneda}{monto}\n\uD83D\uDCB3 *Alias:* {alias}\n\nUna vez que lo realices, por favor enviame el comprobante por ac\u00E1. \u00A1Muchas gracias! \uD83D\uDE0A`
        },
        {
            id: 'welcome',
            name: 'Bienvenida',
            icon: Sparkles,
            text: user?.welcomeTemplate ?? `\u00A1Hola {nombre_pila}! \uD83D\uDC4B\n\n\u00A1Qu\u00E9 alegr\u00EDa saludarte! Te damos la bienvenida oficial a *{negocio}*. \u2728\n\nEstamos muy felices de que te sumes a tus clases de *{servicio}*. Queremos que tengas la mejor experiencia con nosotros.\n\nCualquier duda o consulta que tengas, pod\u00E9s escribirme por este medio. \u00A1Nos vemos pronto! \uD83D\uDE0A`
        },
        {
            id: 'generic',
            name: 'Aviso General',
            icon: MessageCircle,
            text: user?.generalTemplate ?? `\uD83D\uDE80 *COMUNICADO IMPORTANTE*\n\n{saludo} {nombre_pila}, te escribimos de *{negocio}* para informarte que:\n\n[ESCRIBIR MENSAJE AQU\u00ED]\n\nCualquier duda quedamos a disposici\u00F3n. \u00A1Saludos! \uD83D\uDC4B`
        }
    ], [user]);

    const [selectedTemplate, setSelectedTemplate] = React.useState(predefinedTemplates[0]);
    const [templateText, setTemplateText] = React.useState(selectedTemplate.text);
    const [isSending, setIsSending] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [selectedAccountId, setSelectedAccountId] = React.useState<number | 'default'>(
        user?.paymentAccounts?.find((a: any) => a.isDefault)?.id || 'default'
    );

    const handleSelectTemplate = (tpl: any) => {
        setSelectedTemplate(tpl);
        setTemplateText(tpl.text);
    };

    const getActiveAlias = () => {
        if (selectedAccountId === 'default') return user?.bizAlias || 'Alias';
        const account = user?.paymentAccounts?.find((a: any) => a.id === selectedAccountId);
        return account?.alias || user?.bizAlias || 'Alias';
    };

    React.useEffect(() => {
        if (isOpen) {
            setIsSending(false);
            setCurrentIndex(0);
            const defaultAcc = user?.paymentAccounts?.find((a: any) => (a as any).isDefault);
            setSelectedAccountId(defaultAcc?.id || 'default');
            
            // Set initial template only on open
            const initialTemplate = (isPro && user?.reminderTemplate) 
                ? user.reminderTemplate 
                : predefinedTemplates[0].text;
            
            setTemplateText(initialTemplate);
            setSelectedTemplate(predefinedTemplates[0]);
        }
    }, [isOpen, user?.reminderTemplate, isPro, predefinedTemplates]);

    const buildMessage = (student: Student, text: string) => {
        const activeAlias = getActiveAlias();
        const alias = student.billing_alias || activeAlias;
        const amount = Number(student.amount) || 0;
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        const hour = new Date().getHours();
        
        const b_dias = `Buenos d\u00EDas`;
        const b_tardes = `Buenas tardes`;
        const b_noches = `Buenas noches`;
        const saludo = hour < 12 ? b_dias : hour < 20 ? b_tardes : b_noches;
        
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        const mesActual = meses[new Date().getMonth()];
        const nombrePila = student.name ? student.name.split(' ')[0] : '';
        
        const sanitize = (val: string) => val.replace(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();

        return text
            .replace(/{alumno}/g, sanitize(student.name || ''))
            .replace(/{nombre_pila}/g, sanitize(nombrePila))
            .replace(/{saludo}/g, saludo)
            .replace(/{mes_actual}/g, mesActual)
            .replace(/{monto}/g, amount.toLocaleString('es-AR'))
            .replace(/{negocio}/g, sanitize(user?.bizName || 'Tu Profe'))
            .replace(/{servicio}/g, sanitize(serviceName))
            .replace(/{subcategoria}/g, sanitize(student.sub_category || ''))
            .replace(/{metodo}/g, sanitize(student.payment_method || ''))
            .replace(/{vencimiento}/g, (student.deadline_day || '').toString())
            .replace(/{alias}/g, sanitize(alias))
            .replace(/{pago}/g, (student.payment_method === 'Mercado Pago' && isPro && user?.mpAccessToken) ? 'Enlace de pago adjunto' : '')
            .replace(/{moneda}/g, user?.currency || '$')
            .replace(/{dia}/g, new Date().toLocaleDateString('es-AR', { weekday: 'long' }))
            .replace(/{fecha}/g, new Date().toLocaleDateString('es-AR'));
    };

    const openWhatsApp = (student: Student, text: string) => {
        const message = buildMessage(student, text);
        const cleanPhone = student.phone ? student.phone.replace(/\D/g, '') : '';
        const url = cleanPhone
            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleQuickSend = (student: Student) => {
        openWhatsApp(student, templateText);
        onClose();
    };

    const handleStartSending = () => {
        setIsSending(true);
        setCurrentIndex(0);
    };

    const handleSendNext = () => {
        if (currentIndex >= students.length) return;
        const s = students[currentIndex];
        openWhatsApp(s, templateText);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= students.length) {
            showToast.success(`Envío finalizado!`);
            onClose();
        }
    };

    const livePreviewHtml = React.useMemo(() => {
        const student = students[0];
        const raw = student ? buildMessage(student, templateText) : templateText;
        return raw.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/\*(.*?)\*/g, '<strong class="font-extrabold text-white">$1</strong>')
                  .replace(/_(.*?)_/g, '<em class="italic opacity-90">$1</em>')
                  .replace(/~(.*?)~/g, '<del class="line-through opacity-50">$1</del>')
                  .replace(/[\uFFFD]/g, '');
    }, [students, templateText, user, isPro, getActiveAlias]); // buildMessage depends on user, isPro, getActiveAlias

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
                            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 60 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-lg md:max-w-xl h-full md:h-auto md:max-h-[92vh] bg-surface dark:bg-bg-soft md:rounded-[28px] shadow-2xl flex flex-col overflow-hidden border border-border-main"
                        >
                            {!isSending ? (
                                <>
                                    {/* Header */}
                                    <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-black text-emerald-400 uppercase">
                                                    {(students.length === 1 && students[0]) ? students[0].name?.charAt(0) : students.length}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text-main leading-none">
                                                    {students.length === 1 ? (students[0]?.name || 'Alumno') : `${students.length} alumnos`}
                                                </p>
                                                <p className="text-[11px] font-medium text-text-muted mt-0.5 leading-none">
                                                    {students.length === 1
                                                        ? (students[0]?.phone || <span className="text-amber-500">Sin teléfono</span>)
                                                        : 'Envio masivo'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95">
                                            <X size={20} className="text-text-muted hover:text-text-main transition-colors" />
                                        </button>
                                    </div>

                                    {/* Template chips */}
                                    <div className="px-5 pb-3 flex gap-2 flex-wrap shrink-0">
                                        {predefinedTemplates.map(tpl => (
                                            <button
                                                key={tpl.id}
                                                onClick={() => handleSelectTemplate(tpl)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                                    selectedTemplate.id === tpl.id
                                                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                                        : 'bg-black/5 dark:bg-white/5 border-border-main text-text-muted hover:border-emerald-500/40 hover:text-text-main'
                                                }`}
                                            >
                                                <tpl.icon size={12} />
                                                <span className="truncate max-w-[120px]">{tpl.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* WhatsApp chat area */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-app px-4 py-4 relative min-h-0">
                                        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                                        <div className="relative space-y-3">
                                            {/* Live preview bubble */}
                                            <div className="flex justify-end">
                                                <div className="bg-[#075E54] dark:bg-[#054740] border border-white/5 rounded-[20px] rounded-tr-none px-3.5 pt-3 pb-1.5 shadow-xl relative overflow-hidden group max-w-[90%]">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                                    <div className="absolute top-0 -right-2 w-3 h-3 overflow-hidden">
                                                        <div className="w-4 h-4 bg-[#075E54] dark:bg-[#054740] rounded-bl-[12px] -translate-y-2 -translate-x-1" />
                                                    </div>

                                                    <p 
                                                        className="text-white text-[14px] leading-[1.55] font-medium whitespace-pre-wrap relative z-10"
                                                        dangerouslySetInnerHTML={{ __html: livePreviewHtml }}
                                                    />
                                                    <div className="flex justify-end items-center gap-1.5 mt-1 select-none opacity-80 relative z-10">
                                                        <span className="text-[10px] text-white/80 font-bold uppercase tracking-tighter tabular-nums text-right">
                                                            {new Date().toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit', hour12: false})}
                                                        </span>
                                                        <div className="flex items-center -space-x-1.5">
                                                            <CheckCheck size={14} strokeWidth={3} className="text-[#34b7f1]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-4 border-t border-border-main flex gap-3 shrink-0">
                                        <button
                                            onClick={onClose}
                                            className="px-5 py-3.5 text-text-muted font-bold rounded-2xl border border-border-main hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest"
                                        >
                                            Cerrar
                                        </button>
                                        {students.length === 1 ? (
                                            <button
                                                onClick={() => handleQuickSend(students[0])}
                                                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest"
                                            >
                                                <Send size={16} strokeWidth={2.5} />
                                                Enviar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleStartSending}
                                                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest"
                                            >
                                                <Send size={16} strokeWidth={2.5} />
                                                Iniciar envío ({students.length})
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Sending flow */
                                <>
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 p-8 animate-in zoom-in duration-500 bg-emerald-500/5">
                                        <div className="relative w-48 h-48 flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse scale-110" />
                                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-black/5 dark:text-white/5" />
                                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * currentIndex) / students.length} className="text-emerald-500 transition-all duration-1000 ease-in-out" />
                                            </svg>
                                            <div className="text-center relative z-10">
                                                <p className="text-6xl font-black text-text-main tracking-tighter tabular-nums drop-shadow-sm">{currentIndex}</p>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mt-1">de {students.length}</p>
                                            </div>
                                        </div>

                                        <div className="text-center space-y-4 w-full px-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Preparado</p>
                                            </div>
                                            <h4 className="text-3xl font-black text-text-main tracking-tight truncate">{students[currentIndex]?.name}</h4>
                                            <p className="text-xs text-text-muted flex items-center justify-center gap-2 font-medium">
                                                <Sparkles size={14} className="text-emerald-500" />
                                                Presioná el botón para abrir WhatsApp
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-5 py-4 border-t border-border-main flex gap-3 shrink-0">
                                        <button
                                            onClick={() => setIsSending(false)}
                                            className="px-5 py-3.5 text-text-muted font-bold rounded-2xl border border-border-main hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[11px] uppercase tracking-widest"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSendNext}
                                            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] uppercase tracking-widest"
                                        >
                                            Enviar a {students[currentIndex]?.name?.split(' ')[0]} <ChevronRight size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default WhatsAppPreviewModal;
