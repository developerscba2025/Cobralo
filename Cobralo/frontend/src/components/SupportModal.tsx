import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

const SupportModal = ({ isOpen, onClose, onSent }: SupportModalProps) => (
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
          className="relative w-full max-w-lg bg-[#0a0f0a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Soporte Cobralo</h3>
                <p className="text-sm text-slate-400 mt-1">Envíanos tu mensaje y te responderemos pronto.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form 
              className="space-y-4" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name');
                const email = formData.get('email');
                const subject = formData.get('subject');
                const message = formData.get('message');
                const mailtoLink = `mailto:developerscba2025@gmail.com?subject=${encodeURIComponent(subject as string)}&body=${encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`)}`;
                window.location.href = mailtoLink;
                onClose(); 
                if (onSent) onSent(); 
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Nombre</label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-green-500/40 transition-all text-sm font-medium text-white" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-green-500/40 transition-all text-sm font-medium text-white" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Asunto</label>
                <input 
                  name="subject"
                  type="text" 
                  required
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-green-500/40 transition-all text-sm font-medium text-white" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Mensaje</label>
                <textarea 
                  name="message"
                  rows={4}
                  required
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-green-500/40 transition-all text-sm font-medium resize-none text-white" 
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                <Send size={16} />
                Enviar Mensaje
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default SupportModal;
