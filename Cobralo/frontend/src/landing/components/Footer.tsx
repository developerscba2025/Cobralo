import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';


interface FooterProps {
  onOpenSupport: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

const Footer = ({ onOpenSupport, onOpenLegal }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-6 overflow-hidden border-t border-white/[0.04]" style={{ background: '#0E1113' }}>
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container max-w-[1200px] mx-auto px-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           
           {/* Branding */}
           <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                 <span className="text-primary font-black italic text-[10px]">C</span>
              </div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-accent">
                 © {currentYear} • COBRALO
              </p>
           </div>

           {/* Quick Links */}
           <div className="flex items-center gap-6">
              {[
                { label: 'Soporte', action: onOpenSupport },
                { label: 'Privacidad', action: () => onOpenLegal('privacy') },
                { label: 'Términos', action: () => onOpenLegal('terms') },
              ].map((link, i) => (
                <button 
                  key={i} 
                  onClick={link.action} 
                  className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-accent"
                >
                  {link.label}
                </button>
              ))}
           </div>

           {/* Socials & Studio */}
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                 <a href="https://instagram.com/studiodevelopers" target="_blank" className="text-zinc-600 hover:text-white transition-all">
                    <Instagram size={14} />
                 </a>
              </div>
              <span className="text-[9px] font-black text-white/30 tracking-[0.1em] font-accent uppercase">
                 BY DEVELOPER STUDIO
              </span>
           </div>

        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
