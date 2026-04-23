import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, Mail, Zap, Shield, Copy, Check } from 'lucide-react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { showToast } from '../components/Toast';

const Support = () => {
    const [isSending, setIsSending] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = (email: string) => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        showToast.success('¡Email copiado al portapapeles!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSending(true);
        
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            subject: formData.get('subject') as string,
            message: formData.get('message') as string,
        };

        try {
            await api.sendSupportMessage(data);
            showToast.success('¡Mensaje enviado con éxito! Te contactaremos pronto.');
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error enviando soporte:', error);
            showToast.error('Error al enviar el mensaje. Intenta de nuevo.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-12 pb-20">
                {/* Header Section */}
                <header className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-7xl font-black text-text-main tracking-tighter uppercase italic flex items-center gap-4">
                            CENTRO DE SOPORTE <span className="text-xs font-black px-3 py-1.5 bg-primary-main/10 text-primary-main rounded-xl not-italic shadow-lg shadow-primary-main/5 animate-pulse">PRO</span>
                        </h1>
                        <p className="text-sm md:text-lg font-bold text-text-muted uppercase tracking-[0.3em] opacity-60">
                            Resolvé tus dudas con atención preferencial
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Interactive Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group p-8 bg-surface/40 backdrop-blur-xl border border-border-main rounded-[40px] hover:border-primary-main/30 transition-all duration-500 shadow-xl shadow-black/5"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary-main/10 flex items-center justify-center text-primary-main group-hover:scale-110 transition-transform mb-6">
                                <Clock size={28} />
                            </div>
                            <h4 className="font-black text-xl uppercase tracking-tighter text-text-main italic mb-2">Tiempo de Respuesta</h4>
                            <p className="text-sm font-bold text-text-muted leading-relaxed opacity-80">
                                Respondemos a todas las consultas en menos de <span className="text-primary-main">24 hs hábiles</span>.
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={() => handleCopyEmail('support@cobralo.info')}
                            className="group p-8 bg-surface/40 backdrop-blur-xl border border-border-main rounded-[40px] hover:border-primary-main/30 transition-all duration-500 shadow-xl shadow-black/5 cursor-pointer relative"
                        >
                            <div className="absolute top-6 right-6 p-2 bg-primary-main/10 text-primary-main rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform mb-6">
                                <Mail size={28} />
                            </div>
                            <h4 className="font-black text-xl uppercase tracking-tighter text-text-main italic mb-2">Email Directo</h4>
                            <p className="text-sm font-bold text-text-main opacity-90 break-all">support@cobralo.info</p>
                            <div className="mt-4 pt-4 border-t border-border-main/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Backup Channel</span>
                                <p className="text-[11px] font-bold text-text-muted mt-1 uppercase">DEVELOPERSCBA2025@GMAIL.COM</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-primary-main to-emerald-800 p-10 rounded-[48px] text-white relative overflow-hidden group shadow-2xl shadow-primary-main/20"
                        >
                            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                                <Shield size={200} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                                        <Zap size={20} className="fill-white" />
                                    </div>
                                    <h4 className="font-black text-2xl uppercase tracking-tighter italic">¿Problemas Críticos?</h4>
                                </div>
                                <p className="text-sm font-bold text-white/80 leading-relaxed max-w-[280px]">
                                    Escribinos directamente al mail de soporte.
                                </p>
                                <div className="mt-8 flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleCopyEmail('support@cobralo.info')}
                                        className="flex items-center justify-between w-full p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white hover:text-primary-main transition-all group/btn"
                                    >
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{copied ? '¡COPIADO!' : 'SUPPORT@COBR...'}</span>
                                        {copied ? <Check size={18} /> : <Copy size={18} className="group-hover/btn:scale-110 transition-transform" />}
                                    </button>
                                    <a 
                                        href="mailto:support@cobralo.info"
                                        className="flex items-center justify-center gap-2 p-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                                    >
                                        <Mail size={12} /> Abrir en App de Correo
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="lg:col-span-8 relative">
                        <div className="absolute inset-0 bg-primary-main/10 blur-[150px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4 opacity-50" />
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative bg-surface/60 backdrop-blur-3xl border border-border-main rounded-[56px] p-8 md:p-14 shadow-2xl shadow-black/10 overflow-hidden"
                        >
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-text-main uppercase italic tracking-tighter">Envianos tu mensaje</h3>
                                <p className="text-text-muted font-bold text-sm mt-2 opacity-60 uppercase tracking-widest">Atención personalizada y técnica</p>
                            </div>

                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block opacity-50">Tu Nombre</label>
                                        <input 
                                            name="name"
                                            type="text" 
                                            required
                                            placeholder="Nombre completo"
                                            className="w-full px-8 py-5 bg-bg-app/50 text-text-main rounded-3xl border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none transition-all font-bold text-base shadow-inner" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block opacity-50">Correo de Contacto</label>
                                        <input 
                                            name="email"
                                            type="email" 
                                            required
                                            placeholder="Tu email"
                                            className="w-full px-8 py-5 bg-bg-app/50 text-text-main rounded-3xl border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none transition-all font-bold text-base shadow-inner" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block opacity-50">Motivo de Consulta</label>
                                    <input 
                                        name="subject"
                                        type="text" 
                                        required
                                        placeholder="Describí tu consulta con el mayor detalle posible..."
                                        className="w-full px-8 py-5 bg-bg-app/50 text-text-main rounded-3xl border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none transition-all font-bold text-base shadow-inner" 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block opacity-50">¿En qué podemos ayudarte?</label>
                                    <textarea 
                                        name="message"
                                        rows={6}
                                        required
                                        placeholder="Detallá tu consulta aquí para poder asistirte mejor..."
                                        className="w-full px-8 py-8 bg-bg-app/50 text-text-main rounded-[40px] border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none resize-none transition-all font-bold text-base shadow-inner" 
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSending}
                                    className={`w-full py-6 sm:py-7 ${isSending ? 'bg-primary-main/50' : 'bg-primary-main hover:bg-emerald-600'} text-white font-black uppercase tracking-[0.4em] text-xs rounded-[32px] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-primary-main/30 group active:scale-[0.98] mt-4`}
                                >
                                    {isSending ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <span>Enviar Mensaje</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>

                {/* FAQ / Quick Links */}
                <div className="pt-12 border-t border-border-main/50">
                    <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center mb-8 opacity-40">Accesos Rápidos</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: '¿Cómo cobrar con MP?', desc: 'Vinculá tu cuenta en menos de 1 minuto.', href: '/app/settings?tab=payment-accounts' },
                            { title: 'Gestión de Alumnos', desc: 'Aprendé a cargar y organizar tu academia.', href: '/app/students' },
                            { title: 'Planes y Precios', desc: 'Conocé todos los beneficios de Cobralo PRO.', href: '/app/settings?tab=subscription' }
                        ].map((faq, i) => (
                            <motion.a
                                key={i}
                                href={faq.href}
                                whileHover={{ scale: 1.02 }}
                                className="p-6 bg-surface/20 border border-border-main/50 rounded-3xl hover:bg-surface/40 hover:border-primary-main/20 transition-all cursor-pointer group block"
                            >
                                <p className="text-xs font-black text-text-main uppercase tracking-tight mb-1 group-hover:text-primary-main transition-colors">{faq.title}</p>
                                <p className="text-[10px] font-bold text-text-muted opacity-70 uppercase tracking-tighter">{faq.desc}</p>
                                <p className="text-[9px] font-black text-primary-main/60 uppercase tracking-widest mt-3 group-hover:text-primary-main transition-colors">Ver →</p>
                            </motion.a>
                        ))}
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Support;
