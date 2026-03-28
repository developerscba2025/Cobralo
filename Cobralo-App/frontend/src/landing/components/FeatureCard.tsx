import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, desc, pills, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, borderColor: 'rgba(34, 197, 94, 0.3)' }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="p-8 glass-card group transition-all cursor-default"
  >
    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-primary/20">
      <Icon className="text-primary-light" size={24} />
    </div>
    <h3 className="text-xl font-black mb-3 text-white">{title}</h3>
    <p className="text-text-muted text-sm leading-relaxed mb-6">{desc}</p>
    <div className="flex flex-wrap gap-2">
      {pills.map((p: string) => (
        <span key={p} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-text-dim">
          {p}
        </span>
      ))}
    </div>
  </motion.div>
);

export default FeatureCard;
