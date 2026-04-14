import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, AlertCircle, Check, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { showToast } from './Toast';
import { api } from '../services/api';
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



const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({ isOpen, onClose, students, user, isPro }) => {
    const predefinedTemplates = React.useMemo(() => [
        {
            id: 'billing',
            name: 'Recordatorio de Pago',
            icon: FileText,
            text: user?.reminderTemplate ?? `👋 Hola *{alumno}*,\n\nTe saludamos de *{negocio}*. Te enviamos este recordatorio por tu pago de *{servicio}*.\n\n📌 *Detalles:*\n💰 *Monto:* {moneda}{monto}\n🏦 *Mi Alias:* {alias}\n\n✅ Podés realizar el pago o cargar tu comprobante aquí:\n🔗 {pago}\n\n¡Muchas gracias!`
        },
        {
            id: 'welcome',
            name: 'Bienvenida',
            icon: Sparkles,
            text: user?.welcomeTemplate ?? `✨ ¡Hola *{alumno}*! Te damos la bienvenida oficial a *{negocio}*.\n\nEstamos muy felices de que te sumes a nuestras clases de *{servicio}*.\n\nCualquier duda que tengas, podés escribirnos por acá. ¡Nos vemos en clase! 🚀`
        },
        {
            id: 'generic',
            name: 'Aviso General',
            icon: MessageCircle,
            text: user?.generalTemplate ?? `📢 *AVISO IMPORTANTE*\n\nHola *{alumno}*, te escribimos de *{negocio}* para informarte lo siguiente:\n\n[ESCRIBIR MENSAJE AQUÍ]\n\n¡Saludos!`
        }
    ], [user]);

    const [selectedTemplate, setSelectedTemplate] = React.useState(predefinedTemplates[0]);
    const [templateText, setTemplateText] = React.useState(selectedTemplate.text);
    
    const [isSending, setIsSending] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [selectedAccountId, setSelectedAccountId] = React.useState<number | 'default'>(
        user?.paymentAccounts?.find((a: any) => a.isDefault)?.id || 'default'
    );

    // Sync template text when selecting a predefined one
    const handleSelectTemplate = (tpl: typeof predefinedTemplates[0]) => {
        setSelectedTemplate(tpl);
        setTemplateText(tpl.text);
    };

    // Get current alias based on selection
    const getActiveAlias = () => {
        if (selectedAccountId === 'default') return user?.bizAlias || 'Alias';
        const account = user?.paymentAccounts?.find((a: any) => a.id === selectedAccountId);
        return account?.alias || user?.bizAlias || 'Alias';
    };

    // Reset state when opened
    React.useEffect(() => {
        if (isOpen) {
            setIsSending(false);
            setCurrentIndex(0);
            const defaultAcc = user?.paymentAccounts?.find((a: any) => a.isDefault);
            setSelectedAccountId(defaultAcc?.id || 'default');
            
            // Use user's custom template if available as default
            if (isPro && user?.reminderTemplate) {
                setTemplateText(user.reminderTemplate);
            } else {
                setTemplateText(predefinedTemplates[0].text);
            }
        }
    }, [isOpen, user, isPro, predefinedTemplates]);

    const handleStartSending = () => {
        setIsSending(true);
        setCurrentIndex(0);
    };

    const handleSendNext = async () => {
        if (currentIndex >= students.length) return;
        
        const s = students[currentIndex];
        const activeAlias = getActiveAlias();
        const alias = s.billing_alias || activeAlias;
        const amount = Number(s.amount) || 0;
        const serviceName = (s.service_name === 'General' && s.sub_category) ? s.sub_category : (s.service_name || '');
        
        let payLink = '';
        if (s.payment_method === 'Mercado Pago' && isPro && user?.mpAccessToken) {
            try {
                const now = new Date();
                const res = await api.createStudentPaymentLink({
                    studentId: s.id,
                    amount: amount,
                    title: `Pago - ${s.name}`,
                    year: now.getFullYear(),
                    month: now.getMonth() + 1
                });
                payLink = res.init_point;
            } catch (err) {
                console.error('Error generating payment link:', err);
            }
        }

        const message = templateText
            .replace(/{alumno}/g, s.name || '')
            .replace(/{monto}/g, amount.toLocaleString('es-AR'))
            .replace(/{negocio}/g, user?.bizName || 'Tu Profe')
            .replace(/{servicio}/g, serviceName)
            .replace(/{subcategoria}/g, s.sub_category || '')
            .replace(/{metodo}/g, s.payment_method || '')
            .replace(/{vencimiento}/g, (s.deadline_day || '').toString())
            .replace(/{alias}/g, alias)
            .replace(/{pago}/g, payLink || '')
            .replace(/{moneda}/g, user?.currency || '$')
            .replace(/{dia}/g, new Date().toLocaleDateString('es-AR', { weekday: 'long' }))
            .replace(/{fecha}/g, new Date().toLocaleDateString('es-AR'));
            
        const cleanPhone = s.phone ? s.phone.replace(/\D/g, '') : '';
        const url = cleanPhone 
            ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            
        window.open(url, '_blank');
        
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        
        if (nextIndex >= students.length) {
            showToast.success('¡Envío finalizado!');
            onClose();
        }
    };

    const getPreviewMessage = (student: Student) => {
        const activeAlias = getActiveAlias();
        const alias = student.billing_alias || activeAlias;
        const amount = Number(student.amount) || 0;
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        
        return templateText
            .replace(/{alumno}/g, student.name || '')
            .replace(/{monto}/g, amount.toLocaleString('es-AR'))
            .replace(/{negocio}/g, user?.bizName || 'Tu Profe')
            .replace(/{servicio}/g, serviceName)
            .replace(/{subcategoria}/g, student.sub_category || '')
            .replace(/{metodo}/g, student.payment_method || '')
            .replace(/{vencimiento}/g, (student.deadline_day || '').toString())
            .replace(/{alias}/g, alias)
            .replace(/{pago}/g, (student.payment_method === 'Mercado Pago' && isPro && user?.mpAccessToken) ? 'https://mpago.la/...' : '')
            .replace(/{moneda}/g, user?.currency || '$')
            .replace(/{dia}/g, new Date().toLocaleDateString('es-AR', { weekday: 'long' }))
            .replace(/{fecha}/g, new Date().toLocaleDateString('es-AR'));
    };

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] bg-white dark:bg-bg-dark md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-border-main"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-border-main flex items-center justify-between bg-zinc-50/50 dark:bg-bg-soft/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-main/10 flex items-center justify-center">
                                    <MessageCircle className="text-primary-main" size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl md:text-2xl font-black text-text-main uppercase tracking-tighter italic">
                                        Envío Masivo <span className="text-xs font-black px-2 py-1 bg-primary-main/10 text-primary-main rounded-lg not-italic shadow-lg shadow-primary-main/5 ml-2">PRO</span>
                                    </h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">{students.length} Alumnos seleccionados</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-95">
                                <X size={24} className="text-text-muted" />
                            </button>
                        </div>

                        {/* Mixed Content: Sidebar + Preview */}
                        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
                            
                            {!isSending && (
                                <aside className="w-full lg:w-[350px] border-b lg:border-b-0 lg:border-r border-border-main p-6 space-y-8 overflow-y-auto custom-scrollbar bg-zinc-50/30 dark:bg-black/10">
                                    
                                    {/* Template Library */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60 italic">Librería de Plantillas</p>
                                        <div className="grid gap-2">
                                            {predefinedTemplates.map((tpl) => (
                                                <button
                                                    key={tpl.id}
                                                    onClick={() => handleSelectTemplate(tpl)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                                                        selectedTemplate.id === tpl.id
                                                        ? 'bg-primary-main border-primary-main text-white shadow-xl shadow-primary-main/20'
                                                        : 'bg-white dark:bg-bg-soft border-border-main text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                                                    }`}
                                                >
                                                    <tpl.icon size={20} className={selectedTemplate.id === tpl.id ? 'text-white' : 'text-primary-main'} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{tpl.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Account / Alias Selection */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 opacity-60 italic">Pagar a (Alias)</p>
                                        <div className="grid gap-2">
                                            <button
                                                onClick={() => setSelectedAccountId('default')}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                                                    selectedAccountId === 'default'
                                                    ? 'border-primary-main ring-2 ring-primary-main/20 bg-primary-main/5 text-primary-main'
                                                    : 'bg-white dark:bg-bg-soft border-border-main text-text-muted'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Global</span>
                                                    <span className="text-[10px] font-black uppercase truncate">{user?.bizAlias || 'Alias Global'}</span>
                                                </div>
                                                {selectedAccountId === 'default' && <Check size={16} />}
                                            </button>
                                            
                                            {user?.paymentAccounts?.map((acc: any) => (
                                                <button
                                                    key={acc.id}
                                                    onClick={() => setSelectedAccountId(acc.id)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                                                        selectedAccountId === acc.id
                                                        ? 'border-primary-main ring-2 ring-primary-main/20 bg-primary-main/5 text-primary-main'
                                                        : 'bg-white dark:bg-bg-soft border-border-main text-text-muted'
                                                    }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{acc.name}</span>
                                                        <span className="text-[10px] font-black uppercase truncate">{acc.alias}</span>
                                                    </div>
                                                    {selectedAccountId === acc.id && <Check size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-primary-main/5 rounded-2xl border border-primary-main/10">
                                        <div className="flex gap-3 text-primary-main mb-2">
                                            <Sparkles size={16} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Sugerencia</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-text-muted leading-relaxed italic opacity-70">
                                            Cualquier cambio que hagas en el Alias de Ajustes se reflejará automáticamente aquí en tu próximo envío.
                                        </p>
                                    </div>
                                </aside>
                            )}

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                {!isSending ? (
                                    <div className="space-y-8 h-full flex flex-col">
                                        {/* Editor */}
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center justify-between ml-2">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic opacity-60">Personalizar Plantilla</p>
                                                <div className="flex gap-2 relative">
                                                    {['{alumno}', '{monto}', '{servicio}', '{alias}', '{pago}', '{mensaje}', '{dia}', '{fecha}'].map(v => (
                                                        <button 
                                                            key={v}
                                                            onClick={() => setTemplateText((prev: string) => prev + ' ' + v)}
                                                            className="px-2 py-1 bg-zinc-100 dark:bg-white/5 text-[9px] font-black text-text-muted hover:text-primary-main rounded-md transition-colors"
                                                        >
                                                            +{v.replace(/[{}]/g, '')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <textarea 
                                                value={templateText}
                                                onChange={(e) => setTemplateText(e.target.value)}
                                                className="w-full h-full min-h-[250px] p-6 lg:p-10 bg-surface dark:bg-black/20 text-sm font-bold text-text-main rounded-[2.5rem] border border-border-main focus:ring-4 focus:ring-primary-main/10 transition-all outline-none leading-relaxed resize-none shadow-inner font-accent italic"
                                                placeholder="Personalizá el mensaje masivo..."
                                            />
                                        </div>

                                        {/* Preview Drawer */}
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-2 italic opacity-60">Vista Previa Real ({students[0]?.name})</p>
                                            <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-[2rem] border border-dashed border-border-main/50 relative overflow-hidden italic">
                                                <p className="text-[11px] font-bold text-text-main whitespace-pre-wrap leading-relaxed opacity-70">
                                                    {students[0] ? getPreviewMessage(students[0]) : 'No hay alumnos seleccionados'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center space-y-12 animate-in zoom-in duration-500">
                                        <div className="relative w-48 h-48 flex items-center justify-center">
                                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                                <circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-white/5" />
                                                <circle cx="96" cy="96" r="90" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={565} strokeDashoffset={565 - (565 * currentIndex) / students.length} className="text-primary-main transition-all duration-700 ease-out stroke-round" />
                                            </svg>
                                            <div className="text-center group">
                                                <p className="text-6xl font-black text-text-main tracking-tighter tabular-nums mb-1 italic translate-x-1">{currentIndex}</p>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40">de {students.length}</p>
                                            </div>
                                        </div>

                                        <div className="text-center space-y-4 max-w-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-black text-primary-main uppercase tracking-[0.4em] mb-2 animate-pulse">Siguiente Alumno</span>
                                                <h4 className="text-3xl font-black text-text-main tracking-tight uppercase italic truncate w-full">{students[currentIndex]?.name}</h4>
                                                <p className="text-xs font-bold text-text-muted flex items-center gap-2">
                                                    <AlertCircle size={14} className="text-primary-main" /> Haz clic para abrir WhatsApp
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Mini Queue Preview */}
                                        <div className="flex gap-2 overflow-hidden w-full justify-center opacity-40 grayscale blur-[1px]">
                                            {students.slice(currentIndex + 1, currentIndex + 5).map(s => (
                                                <div key={s.id} className="px-4 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap">
                                                    {s.name}
                                                </div>
                                            ))}
                                            {students.length > currentIndex + 5 && <div className="px-4 py-2 text-[10px] font-black opacity-30">...</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-border-main bg-zinc-50/50 dark:bg-bg-soft/20 flex gap-4">
                            <button
                                onClick={() => isSending ? setIsSending(false) : onClose()}
                                className="px-8 py-4 bg-white dark:bg-bg-dark text-text-muted font-black rounded-2xl border border-border-main transition-all uppercase tracking-widest text-[10px] hover:bg-zinc-100 dark:hover:bg-white/5"
                            >
                                {isSending ? 'Cancelar Envío' : 'Cancelar'}
                            </button>
                            
                            {!isSending ? (
                                <button
                                    onClick={handleStartSending}
                                    className="flex-1 py-4 bg-primary-main text-white font-black rounded-2xl shadow-xl shadow-primary-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[11px] italic"
                                >
                                    <Send size={20} /> Iniciar Envío Masivo
                                </button>
                            ) : (
                                <button
                                    onClick={handleSendNext}
                                    className="flex-1 py-4 bg-primary-main text-white font-black rounded-2xl shadow-xl shadow-primary-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[11px] italic"
                                >
                                    Enviar a {students[currentIndex]?.name} <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default WhatsAppPreviewModal;
