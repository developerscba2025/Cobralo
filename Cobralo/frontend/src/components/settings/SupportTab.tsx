import React, { useState } from 'react';
import { Send, HelpCircle } from 'lucide-react';
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
            showToast.success('Mensaje enviado. Te contactaremos pronto.');
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error enviando soporte:', error);
            showToast.error('Error al enviar el mensaje. Intenta de nuevo.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl transition-all">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                        <HelpCircle size={24} className="text-primary-main" /> Soporte Técnico
                    </h2>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        Contactá a nuestro equipo para resolver tus dudas.
                    </p>
                </div>
            </div>

            {/* Support Form Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-10 bg-bg-app rounded-[24px] lg:rounded-[48px] border border-border-main">
                <form className="space-y-6 md:col-span-2 relative" onSubmit={handleSubmit}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Tu Nombre</label>
                            <input 
                                name="name"
                                type="text" 
                                required
                                placeholder="Ej: Juan Pérez"
                                className="w-full p-5 bg-surface text-text-main rounded-2xl border border-border-main shadow-sm focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/10 outline-none transition-all font-medium text-sm" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Tu Email</label>
                            <input 
                                name="email"
                                type="email" 
                                required
                                placeholder="juan@email.com"
                                className="w-full p-5 bg-surface text-text-main rounded-2xl border border-border-main shadow-sm focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/10 outline-none transition-all font-medium text-sm" 
                            />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Asunto</label>
                            <input 
                                name="subject"
                                type="text" 
                                required
                                placeholder="¿En qué podemos ayudarte?"
                                className="w-full p-5 bg-surface text-text-main rounded-2xl border border-border-main shadow-sm focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/10 outline-none transition-all font-medium text-sm" 
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Mensaje</label>
                            <textarea 
                                name="message"
                                rows={6}
                                required
                                placeholder="Escribe tu mensaje aquí..."
                                className="w-full p-5 bg-surface text-text-main rounded-2xl border border-border-main shadow-sm focus:border-primary-main/40 focus:ring-4 focus:ring-primary-main/10 outline-none resize-none transition-all font-medium text-sm" 
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit"
                            disabled={isSending}
                            className={`w-full md:w-auto px-10 py-5 ${isSending ? 'bg-primary-main/50 cursor-not-allowed' : 'bg-primary-main hover:scale-[1.02] active:scale-95'} text-white font-black uppercase tracking-widest rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-main/20`}
                        >
                            {isSending ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={20} />
                                    Enviar Mensaje
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupportTab;
