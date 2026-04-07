import { motion } from 'framer-motion';
import { Check, Smartphone, Bell, CreditCard, LayoutDashboard } from 'lucide-react';

/* ─── Phone mockup ─────────────────────────────────── */
const PhoneMockup = () => (
  <div className="relative flex justify-center">
    {/* Glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-80 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.2) 0%, transparent 70%)', filter: 'blur(32px)' }}
    />

    {/* Shell */}
    <div
      className="relative w-[240px] h-[480px] rounded-[44px] flex flex-col overflow-hidden"
      style={{
        background: '#0E1113',
        border: '2px solid rgba(255,255,255,0.12)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Dynamic island */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-24 h-6 rounded-full flex items-center justify-center gap-2"
          style={{ background: '#000' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="w-9 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between px-6 py-1">
        <span className="text-[10px] font-black" style={{ color: '#fafafa' }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 rounded-sm border" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
            <div className="h-full rounded-sm w-3/4" style={{ background: '#22c55e' }} />
          </div>
        </div>
      </div>

      {/* App header */}
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[9px] font-medium" style={{ color: '#a1a1aa' }}>Buenos días,</p>
          <p className="text-base font-black italic tracking-tighter" style={{ color: '#4ade80' }}>COBRALO</p>
        </div>
        <div className="relative">
          <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-[11px] font-black text-white" style={{ background: '#166534' }}>M</div>
          <span className="absolute -top-1 -right-1 w-4 h-4 text-[7px] font-black rounded-full flex items-center justify-center text-white" style={{ background: '#ef4444' }}>4</span>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex-1 px-5 py-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Este mes', value: '$248.500', color: '#4ade80' },
            { label: 'Pendientes', value: '4 alumnos', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-2xl" style={{ background: '#171A1D', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[8px] mb-0.5" style={{ color: '#a1a1aa' }}>{s.label}</p>
              <p className="text-[12px] font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Today */}
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(161,161,170,0.5)' }}>HOY</p>
        <div className="space-y-2">
          {[
            { name: 'Lucía F.', time: '14:00', ok: true },
            { name: 'Tomás Q.', time: '15:30', ok: false },
            { name: 'Vale R.', time: '17:00', ok: true },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl" style={{ background: '#171A1D', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>{row.name[0]}</div>
                <div>
                  <p className="text-[10px] font-semibold" style={{ color: '#fafafa' }}>{row.name}</p>
                  <p className="text-[8px]" style={{ color: '#a1a1aa' }}>{row.time}</p>
                </div>
              </div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-lg"
                style={row.ok
                  ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' }
                  : { background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                {row.ok ? '✓' : '⚠'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="px-4 pb-5">
        <div className="flex justify-around p-2.5 rounded-3xl" style={{ background: '#171A1D', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { icon: LayoutDashboard, active: true },
            { icon: Users2, active: false },
            { icon: Calendar2, active: false },
            { icon: SettingsIcon, active: false },
          ].map((item, i) => (
            <div key={i} className="w-9 h-8 flex items-center justify-center rounded-xl"
              style={item.active ? { background: '#22c55e' } : {}}>
              <item.icon size={14} style={{ color: item.active ? '#0E1113' : 'rgba(161,161,170,0.5)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Store badges */}
    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-3 whitespace-nowrap">
      {[
        { emoji: '🍎', label: 'App Store' },
        { emoji: '🤖', label: 'Google Play' },
      ].map((b, i) => (
        <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <span className="text-base">{b.emoji}</span>
          <div>
            <p className="text-[9px] font-black" style={{ color: '#fafafa' }}>{b.label}</p>
            <p className="text-[8px]" style={{ color: '#a1a1aa' }}>Próximamente</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Icons needed in the phone mockup
const Users2 = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const Calendar2 = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const SettingsIcon = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);

/* ─── Main ─────────────────────────────────────────── */
const Roadmap = () => {
  const features = [
    { icon: LayoutDashboard, text: 'Dashboard completo con agenda del día' },
    { icon: Bell, text: 'Notificaciones push en tiempo real' },
    { icon: CreditCard, text: 'Cobros y pagos con Mercado Pago' },
    { icon: Smartphone, text: 'Disponible en iOS y Android' },
  ];

  return (
    <section className="section-padding relative overflow-hidden" style={{ background: '#0E1113' }}>
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)' }} />
      <div className="absolute top-1/3 right-0 translate-x-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-5 border"
            style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>
            Próximamente
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight" style={{ color: '#fafafa' }}>
            App móvil{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>nativa.</span>
          </h2>
          <p className="text-base font-medium max-w-xl mx-auto" style={{ color: '#a1a1aa' }}>
            Cobralo en tu bolsillo. iOS y Android con notificaciones push en tiempo real.
          </p>
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phone */}
          <div className="flex justify-center lg:justify-end pb-20 lg:pb-0">
            <PhoneMockup />
          </div>

          {/* Features + waitlist */}
          <div className="space-y-8">
            {/* Feature list */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] as any }}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: '#171A1D', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <f.icon size={18} style={{ color: '#4ade80' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#d4d4d8' }}>{f.text}</span>
                  <div className="ml-auto flex-shrink-0">
                    <Check size={15} style={{ color: '#22c55e' }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Waitlist / Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-[24px] flex items-center gap-4"
              style={{ background: '#171A1D', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 0 40px rgba(34,197,94,0.04)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Bell size={20} style={{ color: '#4ade80' }} />
              </div>
              <div>
                <p className="text-base font-bold mb-1" style={{ color: '#fafafa' }}>
                  Lanzamiento exclusivo
                </p>
                <p className="text-sm font-medium" style={{ color: '#a1a1aa' }}>
                  Recibirás una notificación en tu dashboard cuando la app esté lista para descargar.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
