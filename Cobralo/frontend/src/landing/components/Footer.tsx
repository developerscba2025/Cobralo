import { motion } from 'framer-motion';
import { Instagram, Youtube } from 'lucide-react';


interface FooterProps {
  onOpenSupport: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

const Footer = ({ onOpenSupport, onOpenLegal }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-4 overflow-hidden border-t border-white/[0.03]" style={{ background: '#090B0D' }}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
        className="container mx-auto px-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           {/* Left: Brand & Tagline */}
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-5 h-5 rounded bg-primary flex items-center justify-center font-black italic text-[8px] text-black">C</div>
                 <span className="text-sm font-black italic tracking-tighter text-white uppercase">COBRALO</span>
              </div>
              <div className="h-3 w-px bg-white/10 hidden md:block" />
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest hidden md:block">
                 © {currentYear}
              </p>
           </div>

           {/* Center: Links */}
           <div className="flex items-center gap-6">
              {[
                { label: 'Funciones', href: '#funciones' },
                { label: 'Soporte', action: onOpenSupport },
                { label: 'Términos', action: () => onOpenLegal('terms') },
              ].map((link, i) => (
                link.action ? (
                  <button key={i} onClick={link.action} className="text-[9px] font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-widest">
                    {link.label}
                  </button>
                ) : (
                  <a key={i} href={link.href} className="text-[9px] font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-widest">
                    {link.label}
                  </a>
                )
              ))}
           </div>

           {/* Right: Credits & Social */}
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 mr-2">
                 <a href="https://instagram.com/studiodevelopers" target="_blank" className="text-zinc-600 hover:text-white transition-colors">
                    <Instagram size={12} />
                 </a>
                 <a href="#" className="text-zinc-600 hover:text-white transition-colors">
                    <Youtube size={14} />
                 </a>
              </div>
              <p className="text-[9px] font-black tracking-widest text-zinc-700 hidden md:block">
                 BY <span className="text-zinc-500">DEVELOPER STUDIO</span>
              </p>
           </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
