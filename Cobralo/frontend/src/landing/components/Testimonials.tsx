import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MessageSquare, CreditCard, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const GRADIENTS = [
  'linear-gradient(135deg, #065f46, #059669)',
  'linear-gradient(135deg, #1e40af, #3b82f6)',
  'linear-gradient(135deg, #7c3aed, #8b5cf6)',
];

const INTEGRATIONS = [
  { icon: MessageSquare, label: 'WhatsApp', color: '#25D366' },
  { icon: CreditCard, label: 'Mercado Pago', color: '#009EE3' },
  { icon: Calendar, label: 'Google Calendar', color: '#4285F4' },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await api.getLandingData();
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials);
        } else {
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]);
      }
    };
    fetchTestimonials();
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
  <section id="testimonios" className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
    {/* Top accent line */}
    <div
      className="absolute top-0 inset-x-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)' }}
    />
    
    {/* Left glow */}
    <div
      className="absolute top-1/2 -left-60 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40 blur-[100px]"
      style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, transparent 65%)' }}
    />

    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 pt-10">
      
      {/* ── Integrations Row ── */}
      <div className="flex flex-col items-center mb-24">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-8">
          Sincroniza con tus herramientas favoritas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {INTEGRATIONS.map((app, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 1 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default"
            >
              <app.icon size={20} style={{ color: app.color }} />
              <span className="text-sm font-bold text-white tracking-tight">{app.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section Header ── */}
      <div className="text-center mb-16">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] mb-6 border"
          style={{ 
            background: 'rgba(34,197,94,0.06)', 
            borderColor: 'rgba(34,197,94,0.2)', 
            color: '#4ade80',
            boxShadow: '0 0 20px rgba(34,197,94,0.1)'
          }}
        >
          TESTIMONIOS
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ color: '#fafafa' }}>
          Lo que dicen <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            nuestros profes.
          </span>
        </h2>
        <p className="text-base font-medium max-w-lg mx-auto opacity-60" style={{ color: '#a1a1aa' }}>
          Basta de planillas Excel, listas de difusión manuales y mensajes olvidados.
        </p>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testimonials.map((t, i) => {
          const gradient = GRADIENTS[i % GRADIENTS.length];
          return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] as any }}
            whileHover={{ y: -8 }}
            className="group relative p-10 rounded-[32px] flex flex-col transition-all duration-500 overflow-hidden"
            style={{
              background: '#171A1D',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* ── Background decoration ── */}
            <div className="absolute top-6 right-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
              <Quote size={120} fill="currentColor" className="text-primary" />
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-8 relative z-10">
              {[...Array(t.rating || 5)].map((_, j) => (
                <Star key={j} size={14} style={{ color: '#fbbf24' }} fill="#fbbf24" strokeWidth={0} />
              ))}
            </div>

            {/* Quote Text */}
            <p className="text-[17px] font-medium leading-[1.65] flex-1 mb-10 relative z-10 italic opacity-90" style={{ color: '#d1d1d6' }}>
              "{t.text}"
            </p>

            {/* Divider */}
            <div className="w-12 h-px bg-white/10 mb-8" />

            {/* Author */}
            <div className="flex items-center gap-4 relative z-10">
              {t.photoUrl ? (
                <img 
                  src={t.photoUrl} 
                  alt={t.name}
                  className="w-12 h-12 rounded-[18px] object-cover flex-shrink-0 transition-all duration-500 group-hover:rounded-2xl group-hover:rotate-6 shadow-xl"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-[18px] overflow-hidden flex items-center justify-center text-sm font-black text-white flex-shrink-0 transition-all duration-500 group-hover:rounded-2xl group-hover:rotate-6 shadow-xl"
                  style={{ background: gradient }}
                >
                  {t.initials}
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-sm font-bold tracking-tight" style={{ color: '#fafafa' }}>{t.name}</p>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] opacity-40" style={{ color: '#a1a1aa' }}>
                  {t.role}
                </p>
              </div>
            </div>
          </motion.div>
        )})}
      </div>
    </div>
  </section>
  );
};

export default Testimonials;
