import { motion } from 'framer-motion';

const LoadingFallback = () => {
  return (
    <div className="fixed inset-0 bg-bg-app flex flex-col items-center justify-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary-main/20 blur-3xl rounded-full transform scale-150 animate-pulse" />
        
        {/* Logo Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary-main flex items-center justify-center font-black italic text-2xl text-black shadow-[0_0_30px_rgba(34,197,94,0.3)] relative z-10">
          C
        </div>
        
        {/* Spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-2 border-transparent border-t-primary-main/30 border-r-primary-main/30 rounded-full"
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-text-muted font-black uppercase tracking-[0.3em] text-[10px]"
      >
        Cargando Experiencia Pro
      </motion.p>
    </div>
  );
};

export default LoadingFallback;
