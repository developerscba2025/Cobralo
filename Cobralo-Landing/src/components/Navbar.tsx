import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn } from 'lucide-react';

const APP_URL = 'http://localhost:5174'; // Change to your production App URL

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          {['Funciones', 'Profes', 'Precios'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-text-muted hover:text-text transition-colors">
              {item}
            </a>
          ))}
          <a href={`${APP_URL}/login`} className="text-sm font-bold text-text-muted hover:text-white transition-all flex items-center gap-2">
            <LogIn size={16} /> Ingresar
          </a>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`${APP_URL}/login?register=true`}
            className="btn btn-primary text-xs !py-3"
          >
            Empezar gratis
          </motion.a>
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
            {['Funciones', 'Profes', 'Precios'].map((item) => (
              <a key={item} onClick={() => setIsOpen(false)} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-text-muted">
                {item}
              </a>
            ))}
            <a href={`${APP_URL}/login`} onClick={() => setIsOpen(false)} className="text-lg font-medium text-text-muted flex items-center gap-2">
              <LogIn size={20} /> Ingresar
            </a>
            <a href={`${APP_URL}/login?register=true`} onClick={() => setIsOpen(false)} className="btn btn-primary w-full justify-center">Empezar gratis</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
