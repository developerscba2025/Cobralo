import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Star } from 'lucide-react';

// Import Mockup Components
import MiniSidebar from './mockup/Sidebar';
import BottomNavMockup from './mockup/BottomNav';
import DashboardView from './mockup/DashboardView';
import StudentsView from './mockup/StudentsView';
import CalendarView from './mockup/CalendarView';
import ClassesView from './mockup/ClassesView';
import PaymentsView from './mockup/PaymentsView';
import NotificationsView from './mockup/NotificationsView';
 import SettingsView from './mockup/SettingsView';






/* ════════════════════════════════════
   MAIN: DashboardMockup
   ════════════════════════════════════ */
const DashboardMockup = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    }
  });

  const renderView = (tab: string) => {
    switch (tab) {
      case 'dashboard': return <DashboardView plan="PRO" />;
      case 'students': return <StudentsView />;
      case 'calendar': return <CalendarView />;
      case 'classes': return <ClassesView />;
      case 'payments': return <PaymentsView plan="PRO" />;
      case 'settings': return <SettingsView />;
      case 'notifications': return <NotificationsView />;
      default: return <DashboardView plan="PRO" />;
    }
  };
  
  // 3D Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Rotation transforms (subtle tilt)
  const rotateX = useTransform(y, [-300, 300], [4, -4]);
  const rotateY = useTransform(x, [-500, 500], [-4, 4]);
  
  // Spring physics for buttery smoothness
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Reflection/Glare transforms
  const glazeX = useTransform(x, [-500, 500], ['-20%', '120%']);
  const glazeY = useTransform(y, [-300, 300], ['-20%', '120%']);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isMobile) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="pt-24 pb-32 relative overflow-hidden" style={{ background: '#090B0D' }} id="tour">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[700px] rounded-full pointer-events-none opacity-20 blur-[150px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.1) 0%, transparent 70%)' }} />

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 relative z-10 px-4">
        
        {/* Superior Header */}
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once:true }} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', color: '#a1a1aa' }}>
            <Star size={12} className="text-green-500 shrink-0" /> Tour Interactivo Pro
          </motion.div>
          
          <h2 className="font-black mb-8 tracking-tighter" style={{ color: '#fafafa', lineHeight: 0.9, fontSize: 'clamp(2rem, 8vw, 6rem)' }}>
            La potencia de <br/>
            <span style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #fafafa 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>un Pro.</span>
          </h2>
        </div>

        {/* Premium App Frame with 3D Tilt */}
        <div 
          className="perspective-[2000px] relative pointer-events-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={containerRef}
        >
          <motion.div
             initial={{ opacity: 0, y: 80, scale: 0.98 }}
             whileInView={{ opacity: 1, y: 0, scale: 1 }}
             viewport={{ once: true }}
             style={!isMobile ? {
               rotateX: springRotateX,
               rotateY: springRotateY,
               transformStyle: 'preserve-3d',
             } : {}}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
             className="max-w-7xl mx-auto relative group"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-[2px] bg-gradient-to-b from-green-500/20 via-transparent to-transparent rounded-[42px] opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-1000" />
            
            <div className="rounded-[44px] p-2.5 relative shadow-[0_100px_200px_-20px_rgba(0,0,0,1)] group/frame overflow-hidden"
              style={{ 
                background: 'linear-gradient(165deg, #2A2F34 0%, #0E1113 40%, #090B0D 60%, #1A1F23 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.4), 0 40px 80px rgba(0,0,0,0.8)'
              }}>
              
              {/* Internal Bezel Light */}
              <div className="absolute inset-0 pointer-events-none rounded-[44px] border-[1px] border-white/5 z-20" />
              
              {/* Dynamic Glare — follows mouse movement */}
              <motion.div 
                style={{ 
                  left: glazeX, 
                  top: glazeY,
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%)' 
                }}
                className="absolute w-[80%] h-[80%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 blur-2xl"
              />

              <div className="rounded-[34px] overflow-hidden relative border border-white/5"
                style={{ background: '#090B0D' }}>
                
                {/* Minimalist Browser Chrome */}
                <div className="flex items-center px-10 py-5 bg-[#0E1113] border-b border-white/[0.05] relative z-40">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 text-[10px] font-black text-zinc-700 bg-black/40 border border-white/5 px-8 py-2 rounded-full uppercase tracking-widest hidden sm:block">
                     app.cobralo.com/{activeTab === 'dashboard' ? 'inicio' : activeTab === 'classes' ? 'clases' : activeTab}
                  </div>
                </div>

              {/* Inner Content Area */}
              <div className="flex h-[580px] md:h-[680px] relative overflow-hidden pb-[64px] md:pb-0">
                  <MiniSidebar active={activeTab} onTabChange={setActiveTab} plan="PRO" />
                  <div className="flex-1 relative overflow-hidden h-full">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeTab}
                          initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }} 
                          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} 
                          exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }} 
                          className="w-full h-full">
                          {renderView(activeTab)}
                        </motion.div>
                      </AnimatePresence>
                  </div>
                  <BottomNavMockup active={activeTab} onTabChange={setActiveTab} />
              </div>

            </div>

            {/* Floating Call to Action */}
            <Link to="/app/login?register=true">
              <motion.div 
                 style={{ translateZ: 100 }}
                 className="absolute -bottom-18 left-1/2 -translate-x-1/2 px-10 py-5 bg-[#22c55e] rounded-[28px] shadow-2xl shadow-primary/40 text-[#090B0D] text-[12px] font-black uppercase tracking-[0.3em] transform transition-all group-hover:-translate-y-1 cursor-pointer z-50 hover:bg-white active:scale-95 text-center min-w-[280px]"
              >
                 Probar Gratis 14 Días
              </motion.div>
            </Link>
          </div>
        </motion.div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default DashboardMockup;
