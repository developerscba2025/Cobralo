import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Users, Calendar, ArrowRight, Zap, CheckCircle2, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingWizardProps {
    hasServices: boolean;
    hasPayments: boolean;
    hasStudents: boolean;
    hasAgenda: boolean;
    onDismiss?: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ hasServices, hasPayments, hasStudents, hasAgenda, onDismiss }) => {

    // Determine progress
    const steps = [
        {
            id: 'service',
            title: '1. Tus Servicios',
            desc: 'Editá los precios base seleccionados en el registro.',
            icon: Layers,
            done: hasServices,
            to: '/app/settings?tab=services',
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: 'payment',
            title: '2. Medios de cobro',
            desc: 'Cargá tu alias o integrá Mercado Pago.',
            icon: CreditCard,
            done: hasPayments,
            to: '/app/settings?tab=payment-accounts',
            color: 'from-purple-500 to-indigo-400'
        },
        {
            id: 'class',
            title: '3. Agenda y Horarios',
            desc: 'Organizá tu grilla semanal para asignar alumnos.',
            icon: Calendar,
            done: hasAgenda, 
            to: '/app/calendar',
            color: 'from-amber-500 to-orange-400'
        },
        {
            id: 'student',
            title: '4. Tu primer alumno',
            desc: 'Registralo y asignalo a tus horarios para cobrarle.',
            icon: Users,
            done: hasStudents,
            to: '/app/students',
            color: 'from-emerald-500 to-teal-400'
        }
    ];

    const completed = steps.filter(s => s.done).length;
    const progress = Math.round((completed / 4) * 100);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 relative"
        >
            {/* Main Container with Glassmorphism */}
            <div className="relative p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-border-main shadow-2xl bg-white/50 dark:bg-zinc-950/40 backdrop-blur-3xl overflow-hidden group/main">
                
                {/* Dynamic Background Glows */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-main/10 rounded-full blur-[120px] pointer-events-none group-hover/main:bg-primary-main/20 transition-all duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover/main:bg-blue-500/10 transition-all duration-1000" />
                
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12 relative z-10">
                    <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-main/10 border border-primary-main/20 text-primary-main text-[10px] font-black uppercase tracking-widest">
                            <Zap size={12} className="fill-current" />
                            Guía de Inicio Rápido
                        </div>
                        <h2 className="text-3xl md:text-4xl xl:text-5xl font-black text-text-main tracking-tighter uppercase italic leading-none">
                            Poné tu academia a <span className="text-primary-main">Volar</span>
                        </h2>
                        <p className="text-text-muted font-bold tracking-tight text-sm md:text-base opacity-80 leading-relaxed text-balance">
                            Completá estos pasos fundamentales para delegar el control de tus alumnos y cobros a Cobralo de forma automática.
                        </p>
                    </div>

                    {/* High-Fidelity Progress Indicator */}
                    <div className="shrink-0 flex items-center gap-6 bg-white dark:bg-black/60 p-5 md:p-6 rounded-[32px] border border-black/[0.03] dark:border-white/[0.05] shadow-xl self-start xl:self-center">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Progreso Total</span>
                            <span className="text-4xl font-black text-text-main tabular-nums leading-none mt-1">{progress}%</span>
                        </div>
                        
                        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="50%" cy="50%" r="40%"
                                    className="stroke-zinc-100 dark:stroke-zinc-800 fill-none"
                                    strokeWidth="8"
                                />
                                <motion.circle
                                    cx="50%" cy="50%" r="40%"
                                    className="stroke-primary-main fill-none"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    initial={{ strokeDashoffset: 251.2, strokeDasharray: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`p-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-primary-main text-white shadow-lg shadow-primary-main/40' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 relative z-10">
                    {steps.map((step, i) => {
                        const isAccessible = i === 0 || steps[i-1].done || step.done;
                        
                        return (
                            <Link 
                                key={step.id} 
                                to={!isAccessible ? '#' : step.to}
                                className={`
                                    group relative flex flex-col p-8 rounded-[40px] border transition-all duration-500 h-full min-h-[220px]
                                    ${step.done 
                                        ? 'bg-emerald-500/[0.02] border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer' 
                                        : (isAccessible
                                            ? 'bg-white dark:bg-zinc-900/40 border-black/[0.05] dark:border-white/[0.05] hover:border-primary-main/40 hover:shadow-2xl hover:shadow-primary-main/10 cursor-pointer'
                                            : 'bg-zinc-100/50 dark:bg-zinc-950/20 border-transparent opacity-40 grayscale cursor-not-allowed')
                                    }
                                    ${isAccessible && "hover:-translate-y-2 active:scale-[0.97]"}
                                `}
                                onClick={(e: React.MouseEvent) => !isAccessible && e.preventDefault()}
                            >
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500
                                        ${step.done 
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                            : (isAccessible 
                                                ? 'bg-zinc-100 dark:bg-zinc-800 text-text-main group-hover:bg-primary-main group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary-main/30' 
                                                : 'bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-400')
                                        }
                                    `}>
                                        <step.icon size={26} strokeWidth={2.5} />
                                    </div>
                                    
                                    {step.done ? (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    ) : isAccessible ? (
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary-main/10 group-hover:text-primary-main transition-colors">
                                            <ArrowRight size={16} />
                                        </div>
                                    ) : null}
                                </div>
                                
                                <div className="relative z-10 flex-1 flex flex-col justify-end">
                                    <h3 className={`font-black uppercase tracking-tight text-[13px] mb-2 transition-colors ${step.done ? 'text-emerald-500' : 'text-text-main group-hover:text-primary-main'}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-[13px] font-bold text-text-muted leading-snug opacity-80 group-hover:opacity-100 transition-opacity text-pretty tracking-tight">
                                        {step.desc}
                                    </p>
                                </div>

                                {/* Hover State Accent Link (Static) */}
                                {!step.done && isAccessible && (
                                    <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                                        <ArrowRight size={20} className="text-primary-main" />
                                    </div>
                                )}
                                
                                {/* Completed Status Highlight */}
                                {step.done && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/[0.03] to-emerald-500/0 pointer-events-none" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {progress === 100 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 p-6 bg-gradient-to-r from-primary-main to-emerald-500 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-primary-main/30 border border-white/20"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Zap size={24} className="fill-current text-white" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tight text-lg leading-none mb-1">¡Listo para despegar!</h4>
                                <p className="text-white/80 font-bold text-xs uppercase tracking-widest">Ya tenés la base configurada</p>
                            </div>
                        </div>
                        <button 
                            onClick={onDismiss}
                            className="px-8 py-3 bg-white text-primary-main font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                            Ir a tablero PRO
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default OnboardingWizard;

