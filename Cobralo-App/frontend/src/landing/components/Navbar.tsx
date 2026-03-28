import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-2xl py-2 shadow-2xl shadow-primary/5 border-b border-primary/10' : 'bg-black/0 backdrop-blur-none py-4 border-b border-transparent'}`}>
      <div className="container flex justify-between items-center">
        <a href="#" className="text-2xl font-black italic tracking-tighter text-[#22c55e]">COBRALO</a>

        <div className="hidden md:flex items-center gap-8">
          {isHome ? (
            ['Funciones', 'Precios'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
                {item}
              </a>
            ))
          ) : (
            <Link to="/" className="text-sm font-medium text-text-muted hover:text-text transition-colors">
              Inicio
            </Link>
          )}
          
          <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text transition-colors flex items-center gap-2">
            <LogIn size={16} /> Ingresar
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/login?register=true" className="btn btn-primary text-xs !py-3">
              Empezar gratis
            </Link>
          </motion.div>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-4 flex flex-col gap-4 md:hidden"
          >
            {['Funciones', 'Precios'].map((item) => (
              <a key={item} onClick={() => setIsOpen(false)} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-text-muted">
                {item}
              </a>
            ))}
            <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-text-muted flex items-center gap-2">
              <LogIn size={20} /> Ingresar
            </Link>
            <Link to="/login?register=true" onClick={() => setIsOpen(false)} className="btn btn-primary w-full justify-center">Empezar gratis</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
