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
        className="mx-auto max-w-6xl rounded-2xl flex items-center justify-between px-4 h-12 relative bg-[#0E1113]/85 backdrop-blur-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]"
        style={{ zIndex: 50 }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black italic text-[12px] bg-[#22c55e] text-[#0E1113] transition-transform duration-300 group-hover:scale-110"
          >
            C
          </div>
          <span className="text-base font-black italic tracking-tighter text-[#4ade80]">
            COBRALO
          </span>
        </a>

        {/* Desktop links — center */}
        <div className="hidden md:flex items-center gap-6">
          {isHome ? (
            NAV_LINKS.map(item => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="text-[12px] font-bold uppercase tracking-wider transition-colors duration-200 text-zinc-400 hover:text-white cursor-pointer bg-transparent border-0 p-0"
              >
                {item.label}
              </button>
            ))
          ) : (
            <Link to="/" className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-50">
              Inicio
            </Link>
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Link
            to="/app/login"
            className="text-[12px] font-bold transition-colors duration-200 px-3 py-1.5 text-zinc-400 hover:text-zinc-50"
          >
            Ingresar
          </Link>

          <Link to="/app/login?register=true">
            <button
              className="px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-[#22c55e] text-[#0E1113] hover:bg-[#4ade80] shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
            >
              Probar gratis →
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-1.5 rounded-xl transition-colors text-[#fafafa] hover:bg-white/5"
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
