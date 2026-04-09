import { motion } from 'framer-motion';
import { Layers, Users, Calendar, ArrowRight, Zap, CheckCircle2, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingWizardProps {
    hasServices: boolean;
    hasPayments: boolean;
    hasStudents: boolean;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ hasServices, hasPayments, hasStudents }) => {
    // Determine progress
    const steps = [
        {
            id: 'service',
            title: '1. ¿Qué vas a enseñar?',
            desc: 'Definí tus clases o áreas de enseñanza y sus precios base.',
            icon: Layers,
            done: hasServices,
            to: '/app/settings?tab=services'
        },
        {
            id: 'payment',
            title: '2. ¿Dónde vas a cobrar?',
            desc: 'Agregá un Alias, CBU o vinculá Mercado Pago para recibir tus pagos.',
            icon: CreditCard,
            done: hasPayments,
            to: '/app/settings?tab=business'
        },
        {
            id: 'student',
            title: '3. Sumá a tu primer alumno',
            desc: 'Registralo y asignale el método de pago y monto correspondiente.',
            icon: Users,
            done: hasStudents,
            to: '/app/students'
        },
        {
            id: 'class',
            title: '4. Armá tu agenda',
            desc: 'Organizá tus horarios y automatizá el control de asistencia.',
            icon: Calendar,
            done: false, 
            to: '/app/calendar'
        }
    ];

    const completed = steps.filter(s => s.done).length;
    const progress = Math.round((completed / 3) * 100); // 3 primary setup steps

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 md:p-10 rounded-[40px] border border-primary-main/20 shadow-2xl bg-white dark:bg-bg-dark relative overflow-hidden"
        >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-main/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                <div className="max-w-xl">
                    <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase flex items-center gap-4">
                        Guía de Inicio <span className="text-3xl">🚀</span>
                    </h2>
                    <p className="text-text-muted mt-3 font-bold tracking-tight text-base opacity-80">
                        Estás a pocos pasos de automatizar tu academia. Completar estos pasos te permitirá delegar el control de tus cobros a Cobralo.
                    </p>
                </div>

                {/* Progress Circle (Premium) */}
                <div className="shrink-0 flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-inner">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tu avance</span>
                        <span className="text-2xl font-black text-primary-main">{progress}%</span>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-bg-dark relative overflow-hidden">
                         <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute bottom-0 left-0 right-0 bg-primary-main"
                         />
                         <Zap size={20} className={`relative z-10 ${progress > 0 ? 'text-white' : 'text-zinc-500'}`} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {steps.map((step, i) => {
                    const isAccessible = i === 0 || steps[i-1].done || step.done;
                    const statusClass = step.done 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : (isAccessible
                            ? 'bg-white dark:bg-bg-dark border-zinc-200 dark:border-zinc-800 hover:border-primary-main/50 cursor-pointer shadow-sm group'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/50 opacity-50 grayscale cursor-not-allowed');

                    return (
                        <Link 
                            key={step.id} 
                            to={step.done || !isAccessible ? '#' : step.to}
                            className={`flex flex-col p-6 rounded-[32px] border transition-all duration-300 relative overflow-hidden ${statusClass} ${isAccessible && !step.done ? 'hover:-translate-y-1 hover:shadow-xl' : ''}`}
                            onClick={(e: React.MouseEvent) => {
                                if (step.done || !isAccessible) e.preventDefault();
                            }}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${step.done ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:text-primary-main group-hover:bg-primary-main/10 transition-colors'}`}>
                                    <step.icon size={22} />
                                </div>
                                {step.done && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                                        <CheckCircle2 size={28} />
                                    </motion.div>
                                )}
                            </div>
                            
                            <h3 className={`font-black uppercase tracking-tight text-[12px] mb-2 ${step.done ? 'text-emerald-600 dark:text-emerald-400 opacity-70' : 'text-text-main group-hover:text-primary-main transition-colors'}`}>
                                {step.title}
                            </h3>
                            <p className="text-[11px] font-bold text-text-muted leading-relaxed opacity-80">
                                {step.desc}
                            </p>
                            
                            {!step.done && isAccessible && (
                                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-main opacity-0 group-hover:opacity-100 transition-all">
                                    Configurar ahora <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>

            {progress === 100 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-4 bg-primary-main rounded-2xl text-white text-center font-black uppercase tracking-widest text-xs"
                >
                    🚀 ¡Iniciaste con todo! Ya podés automatizar tus cobros y clases.
                </motion.div>
            )}
        </motion.div>
    );
};

export default OnboardingWizard;
