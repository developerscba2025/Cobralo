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
          className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-lg bg-[#0E1113]/95 border border-white/10 rounded-[40px] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-3xl"
        >
          {/* Background Decoration Glows */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">Soporte Cobralo</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Contanos en qué podemos ayudarte hoy.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <X size={22} />
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
                <p className="text-white/60 text-sm max-w-[200px]">Te responderemos a tu correo en menos de 24hs.</p>
              </motion.div>
            ) : (
              <form 
                className="space-y-4" 
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-white/50 tracking-widest pl-1">Nombre</label>
                    <input 
                      name="name"
                      type="text" 
                      required
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-white/50 tracking-widest pl-1">Email</label>
                    <input 
                      name="email"
                      type="email" 
                      required
                      placeholder="Tu email"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-white/50 tracking-widest pl-1">Asunto</label>
                  <input 
                    name="subject"
                    type="text" 
                    required
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/40 transition-all text-sm font-medium" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-white/50 tracking-widest pl-1">Mensaje</label>
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
