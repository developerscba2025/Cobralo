import { motion } from 'framer-motion';
import { Layers, Users, Calendar, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingWizardProps {
    hasServices: boolean;
    hasStudents: boolean;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ hasServices, hasStudents }) => {
    // Determine progress
    const steps = [
        {
            id: 'service',
            title: '1. Creá tu primer servicio',
            desc: 'Definí lo que enseñás (clase de piano, curso de inglés, etc.) y su precio.',
            icon: Layers,
            done: hasServices,
            to: '/app/settings?tab=services'
        },
        {
            id: 'student',
            title: '2. Agregá un alumno',
            desc: 'Registrá a tu primer estudiante y asignale el servicio que creaste.',
            icon: Users,
            done: hasStudents,
            to: '/app/students'
        },
        {
            id: 'class',
            title: '3. Agendá una clase',
            desc: 'Organizá tu horario. Al agendar la clase, ¡ya estás listo para usar Cobralo!',
            icon: Calendar,
            done: false, // For this step we just link to calendar, completion is hidden once they have students and services
            to: '/app/calendar'
        }
    ];

    const completed = steps.filter(s => s.done).length;
    const progress = Math.round((completed / 2) * 100); // Because step 3 is optional technically

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 md:p-8 rounded-[32px] border border-primary-main/30 shadow-[0_10px_40px_-15px_rgba(34,197,94,0.3)] bg-surface relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase flex items-center gap-3">
                        ¡Bienvenido a Cobralo! <span className="text-2xl">🎉</span>
                    </h2>
                    <p className="text-text-muted mt-2 font-bold tracking-tight text-sm max-w-lg">
                        Estás a pocos pasos de automatizar tu academia. Completá estos 3 pasos básicos para arrancar con el pie derecho.
                    </p>
                </div>

                {/* Progress Circle (Simplified) */}
                <div className="shrink-0 flex items-center gap-4 bg-bg-app px-5 py-3 rounded-2xl border border-border-main">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Progreso</span>
                        <span className="text-xl font-black text-primary-main">{progress}%</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-bg-soft flex items-center justify-center bg-surface relative overflow-hidden">
                         <div 
                            className="absolute bottom-0 left-0 right-0 bg-primary-main transition-all duration-1000"
                            style={{ height: `${progress}%` }}
                         />
                         <Zap size={16} className={`relative z-10 ${progress > 0 ? 'text-white' : 'text-zinc-500'}`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {steps.map((step, i) => {
                    const statusClass = step.done 
                        ? 'bg-primary-main/5 border-primary-main/30' 
                        : (i === 0 || (i === 1 && steps[0].done) || (i === 2 && steps[1].done)
                            ? 'bg-surface border-border-main hover:border-primary-main/50 cursor-pointer shadow-sm group'
                            : 'bg-bg-app border-border-main/50 opacity-60 grayscale cursor-not-allowed');

                    return (
                        <Link 
                            key={step.id} 
                            to={step.done || (!steps[0].done && i > 0) || (i === 2 && !steps[1].done) ? '#' : step.to}
                            className={`flex flex-col p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden ${statusClass}`}
                            onClick={(e) => {
                                if (step.done || (!steps[0].done && i > 0) || (i === 2 && !steps[1].done)) e.preventDefault();
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step.done ? 'bg-primary-main/20 text-primary-main' : 'bg-bg-app border border-border-main text-text-main group-hover:text-primary-main group-hover:bg-primary-main/5 transition-colors'}`}>
                                    <step.icon size={20} />
                                </div>
                                {step.done && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary-main">
                                        <CheckCircle2 size={24} />
                                    </motion.div>
                                )}
                            </div>
                            
                            <h3 className={`font-black uppercase tracking-tight text-sm mb-1 line-clamp-1 ${step.done ? 'text-primary-main' : 'text-text-main group-hover:text-primary-main transition-colors'}`}>
                                {step.title}
                            </h3>
                            <p className="text-[11px] font-bold text-text-muted leading-relaxed line-clamp-2">
                                {step.desc}
                            </p>
                            
                            {!step.done && (i === 0 || (i === 1 && steps[0].done) || (i === 2 && steps[1].done)) && (
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-main opacity-0 group-hover:opacity-100 transition-opacity">
                                    Ir a configuración <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </motion.div>
    );
};

export default OnboardingWizard;
