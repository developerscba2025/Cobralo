import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Funciones', href: 'funciones' },
  { label: 'Profes', href: 'profes' },
  { label: 'Precios', href: 'precios' },
  { label: 'FAQ', href: 'faq' },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    // Outer wrapper — provides the floating top padding
    <div className="w-full px-4 pt-3 sm:pt-6" style={{ position: 'relative', zIndex: 50 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Pill container ── */}
      <div
        className="mx-auto max-w-6xl rounded-2xl flex items-center justify-between px-6 h-12 relative bg-[#0E1113]/80 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]"
        style={{ zIndex: 50 }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black italic text-[11px] bg-[#22c55e] border border-primary/20 text-[#0E1113] shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all duration-300 group-hover:scale-105"
          >
            C
          </div>
          <span className="text-sm font-black italic tracking-tighter text-[#fafafa] font-accent uppercase">
            COBRALO
          </span>
        </a>

        {/* Desktop links — Improved spacing and font */}
        <div className="hidden md:flex items-center gap-8">
          {isHome ? (
            NAV_LINKS.map(item => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 text-zinc-500 hover:text-primary cursor-pointer font-accent relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))
          ) : (
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 hover:text-[#fafafa] font-accent">
              Inicio
            </Link>
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Link
            to="/app/login"
            className="text-[10px] font-black uppercase tracking-widest transition-colors duration-200 px-3 py-1.5 text-zinc-500 hover:text-zinc-50 font-accent"
          >
            Ingresar
          </Link>

          <Link to="/app/login?register=true">
            <button
              className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-[#22c55e] text-[#0E1113] hover:bg-[#4ade80] shadow-[0_4px_15px_rgba(34,197,94,0.3)] font-accent"
            >
              Probar gratis →
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2.5 rounded-xl transition-colors text-[#fafafa] hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menú"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0E1113] border border-white/10 p-6 rounded-2xl flex flex-col gap-6 md:hidden shadow-2xl z-50 overflow-hidden"
            >
              {NAV_LINKS.map(item => (
                <button
                  key={item.label}
                  onClick={() => { scrollTo(item.href); setIsOpen(false); }}
                  className="text-lg font-bold text-[#fafafa] hover:text-[#4ade80] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <Link
                  to="/app/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-base font-bold text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                >
                  <LogIn size={18} /> Ingresar
                </Link>
                <Link to="/app/login?register=true" onClick={() => setIsOpen(false)}>
                  <button
                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest bg-[#22c55e] text-[#0E1113] hover:bg-[#4ade80]"
                  >
                    Probar gratis →
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Navbar;
