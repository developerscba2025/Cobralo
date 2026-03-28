import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

const SupportModal = ({ isOpen, onClose, onSent }: SupportModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setIsSuccess(true);
      setTimeout(() => {
        onSent();
        onClose();
        setTimeout(() => setIsSuccess(false), 500);
      }, 2000);
    } catch (error) {
      console.error('Error enviando soporte:', error);
      alert('Hubo un problema al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
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
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-bg-soft border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Soporte Cobralo</h3>
                <p className="text-sm text-text-muted mt-1">Envíanos tu mensaje y te responderemos pronto.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center gap-4"
              >
                <div className="w-20 h-20 bg-primary/20 text-primary-light rounded-full flex items-center justify-center">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-xl font-black text-white">¡Mensaje enviado!</h4>
                <p className="text-text-muted text-sm max-w-[200px]">Te responderemos a tu correo en menos de 24hs.</p>
              </motion.div>
            ) : (
              <form 
                className="space-y-4" 
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Nombre</label>
                    <input 
                      name="name"
                      type="text" 
                      required
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Email</label>
                    <input 
                      name="email"
                      type="email" 
                      required
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Asunto</label>
                  <input 
                    name="subject"
                    type="text" 
                    required
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-text-dim tracking-widest pl-1">Mensaje</label>
                  <textarea 
                    name="message"
                    rows={4}
                    required
                    placeholder="Escribe tu mensaje aquí..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium resize-none" 
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSending}
                  className={`w-full py-4 ${isSending ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'} text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20`}
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};

export default SupportModal;
