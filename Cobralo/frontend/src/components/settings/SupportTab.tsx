import React, { useState } from 'react';
import { Send, HelpCircle, Mail, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { showToast } from '../Toast';

const SupportTab: React.FC = () => {
    const [isSending, setIsSending] = useState(false);

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
            showToast.success('¡Mensaje enviado con éxito!');
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error enviando soporte:', error);
            showToast.error('Error al enviar el mensaje. Intenta de nuevo.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black text-text-main tracking-tighter uppercase italic flex items-center gap-4">
                        Centro de Soporte <span className="text-xs font-black px-2 py-1 bg-primary-main/10 text-primary-main rounded-lg not-italic shadow-lg shadow-primary-main/5 animate-pulse">BETA</span>
                    </h2>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                        Gestioná tus consultas con precisión PRO
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Info Cards */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="p-6 bg-surface/50 border border-border-main rounded-[32px] space-y-4 group hover:border-primary-main/30 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-primary-main/10 flex items-center justify-center text-primary-main group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight text-text-main">Tiempo de Respuesta</h4>
                            <p className="text-xs font-medium text-text-muted mt-1 leading-relaxed">Respondemos a todas las consultas en menos de 24hs hábiles.</p>
                        </div>
                    </div>

                    <div className="p-6 bg-surface/50 border border-border-main rounded-[32px] space-y-4 group hover:border-primary-main/30 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-primary-main/10 flex items-center justify-center text-primary-main group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight text-text-main">Email Directo</h4>
                            <p className="text-xs font-medium text-text-muted mt-1">Support@cobralo.info</p>
                            <p className="text-[10px] font-bold text-text-muted/60 mt-1 uppercase">Backup: developerscba2025@gmail.com</p>
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-primary-main to-emerald-800 rounded-[40px] text-white relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <HelpCircle size={120} />
                        </div>
                        <h4 className="font-black text-lg uppercase tracking-tighter leading-tight relative z-10">¿Problemas Críticos?</h4>
                        <p className="text-xs font-bold text-white/80 mt-2 uppercase tracking-widest relative z-10">Escribinos directamente al mail de soporte</p>
                        <div className="mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 relative z-10">
                            <Mail size={20} className="text-white shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-widest truncate">Support@cobralo.info</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Implementation Form */}
                <div className="lg:col-span-8 relative">
                    <div className="absolute inset-0 bg-primary-main/5 blur-[120px] rounded-full pointer-events-none translate-x-1/4" />
                    
                    <div className="relative bg-surface/80 backdrop-blur-3xl border border-border-main rounded-[44px] p-8 md:p-12 shadow-2xl shadow-black/20 overflow-hidden group">
                        {/* Glow ornament */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block italic opacity-60">Tu Identificador</label>
                                    <input 
                                        name="name"
                                        type="text" 
                                        required
                                        placeholder="Nombre completo"
                                        className="w-full px-6 py-4 bg-bg-app text-text-main rounded-2xl border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none transition-all font-bold text-sm shadow-inner" 
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block italic opacity-60">Correo Electrónico</label>
                                    <input 
                                        name="email"
                                        type="email" 
                                        required
                                        placeholder="mi@correo.com"
                                        className="w-full px-6 py-4 bg-bg-app text-text-main rounded-2xl border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none transition-all font-bold text-sm shadow-inner" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block italic opacity-60">Asunto de la Consulta</label>
                                <input 
                                    name="subject"
                                    type="text" 
                                    required
                                    placeholder="¿En qué podemos ayudarte proactivamente?"
                                    className="w-full px-6 py-4 bg-bg-app text-text-main rounded-2xl border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none transition-all font-bold text-sm shadow-inner" 
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 block italic opacity-60">Detalle del Mensaje</label>
                                <textarea 
                                    name="message"
                                    rows={5}
                                    required
                                    placeholder="Escribí aquí los detalles de tu requerimiento..."
                                    className="w-full px-6 py-6 bg-bg-app text-text-main rounded-[24px] border border-border-main focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/5 outline-none resize-none transition-all font-bold text-sm shadow-inner" 
                                ></textarea>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSending}
                                className={`w-full py-5 ${isSending ? 'bg-primary-main/50' : 'bg-primary-main hover:bg-emerald-600'} text-white font-black uppercase tracking-[0.3em] rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-main/20 group active:scale-[0.98]`}
                            >
                                {isSending ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Enviar Mensaje Pro
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportTab;
