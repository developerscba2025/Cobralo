import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Profes', href: '#profes' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    // Outer wrapper — provides the floating top padding
    <div className="w-full px-4 pt-4 sm:pt-10 pointer-events-auto">
      {/* ── Pill container ── */}
      <div
        className="mx-auto max-w-6xl rounded-2xl flex items-center justify-between px-4 h-12 relative"
        style={{
          background: 'rgba(14,17,19,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black italic text-[12px] transition-transform duration-300 group-hover:scale-110"
            style={{ background: '#22c55e', color: '#0E1113' }}
          >
            C
          </div>
          <span className="text-base font-black italic tracking-tighter" style={{ color: '#4ade80' }}>
            COBRALO
          </span>
        </a>

        {/* Desktop links — center */}
        <div className="hidden md:flex items-center gap-6">
          {isHome ? (
            NAV_LINKS.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-[12px] font-bold uppercase tracking-wider transition-colors duration-200"
                style={{ color: '#a1a1aa' }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#fafafa'}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1aa'}
              >
                {item.label}
              </a>
            ))
          ) : (
            <Link to="/" className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>
              Inicio
            </Link>
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Link
            to="/app/login"
            className="text-[12px] font-bold transition-colors duration-200 px-3 py-1.5"
            style={{ color: '#a1a1aa' }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#fafafa'}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget as HTMLAnchorElement).style.color = '#a1a1aa'}
          >
            Ingresar
          </Link>

          <Link to="/app/login?register=true">
            <button
              className="px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{ background: '#22c55e', color: '#0E1113' }}
            >
              Probar gratis →
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-1.5 rounded-xl transition-colors"
          style={{ color: '#fafafa' }}
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
              className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0E1113] border border-white/10 p-6 rounded-2xl flex flex-col gap-6 md:hidden shadow-2xl z-50"
            >
              {NAV_LINKS.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold"
                  style={{ color: '#fafafa' }}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <Link
                  to="/app/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-base font-bold"
                  style={{ color: '#a1a1aa' }}
                >
                  <LogIn size={18} /> Ingresar
                </Link>
                <Link to="/app/login?register=true" onClick={() => setIsOpen(false)}>
                  <button
                    className="w-full py-4 rounded-xl font-black uppercase tracking-widest"
                    style={{ background: '#22c55e', color: '#0E1113' }}
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
