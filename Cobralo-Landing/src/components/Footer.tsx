import { motion } from 'framer-motion';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { APP_URL } from '../config';

interface FooterProps {
  onOpenSupport: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

const Footer = ({ onOpenSupport, onOpenLegal }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-50 mt-12 border-t border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden text-left pointer-events-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="w-full px-8 md:px-12 lg:px-24 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-32">
          {/* Brand & Socials */}
          <div className="space-y-6 text-left">
            <div className="space-y-4">
              <a href="#" className="text-2xl font-black italic tracking-tighter text-primary-light block">COBRALO</a>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                Una plataforma segura y confiable para gestionar tus cobros.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, href: "https://www.instagram.com/studiodevelopers/" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -3, color: '#22c55e' }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim transition-colors hover:border-primary/20"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links: Producto */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Producto</h4>
            <nav className="flex flex-col gap-3">
              {[
                { name: 'Funciones', href: '#funciones' },
                { name: 'Precios', href: '#precios' },
                { name: 'App Login', href: `${APP_URL}/login` }
              ].map(link => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-1 group w-fit footer-link"
                >
                  {link.name}
                  {link.href.startsWith('http') && <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />}
                </a>
              ))}
            </nav>
          </div>

          {/* Links: Legal */}
          <div className="space-y-6 text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Legal</h4>
            <nav className="flex flex-col gap-3">
              {[
                { name: 'Términos', type: 'terms' as const },
                { name: 'Privacidad', type: 'privacy' as const },
                { name: 'Soporte', type: 'support' as const }
              ].map(link => (
                <a 
                  key={link.name} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (link.type === 'support') onOpenSupport();
                    else onOpenLegal(link.type);
                  }}
                  href="#" 
                  className="text-sm text-text-muted hover:text-white transition-colors flex items-center justify-between group grayscale hover:grayscale-0 sm:max-w-[150px] footer-link"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[11px] text-text-dim/60 font-medium whitespace-nowrap">
            © {currentYear} Cobralo Inc. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
