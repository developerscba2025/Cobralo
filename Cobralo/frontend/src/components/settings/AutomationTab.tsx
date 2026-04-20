import React, { useEffect, useRef } from 'react';
import { MessageSquare, RotateCcw, CheckCheck } from 'lucide-react';
import type { User } from '../../services/api';
import { ProFeature } from '../ProGuard';

interface AutomationTabProps {
    user: Partial<User>;
    setUser: (u: Partial<User>) => void;
    isPro: boolean;
}

const AutoResizeTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [props.value]);
    return <textarea ref={ref} {...props} className={`${props.className} overflow-hidden resize-none`} />;
};

const WhatsappMessageEditor = ({ value, onChange, disabled, placeholder }: any) => {
    return (
        <div className="bg-zinc-50 dark:bg-[#0c0c0e] p-4 md:p-6 lg:p-8 rounded-[20px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 relative overflow-hidden flex flex-col justify-end min-h-[240px] shadow-inner">
            {/* Background Pattern - Subtle dots */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            
            <div className="relative max-w-[95%] md:max-w-[85%] ml-auto z-10 w-full group">
                {/* Chat Bubble Tail */}
                <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-1.5 text-[#d9fdd3] dark:text-[#005c4b] mt-0.5">
                    <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"/>
                    <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"/>
                </svg>
                
                {/* Chat Bubble - Authentic WhatsApp Green */}
                <div className={`bg-[#d9fdd3] dark:bg-[#005c4b] rounded-[12px] rounded-tr-[0px] p-2.5 px-3 pb-1.5 shadow-sm relative flex flex-col transition-all border border-black/5 dark:border-white/5 ${disabled ? 'opacity-50' : 'group-focus-within:ring-2 group-focus-within:ring-emerald-500/30'}`}>
                    <AutoResizeTextarea
                        disabled={disabled}
                        className={`w-full bg-transparent text-[#111b21] dark:text-[#e9edef] text-[14.5px] resize-none outline-none focus:ring-0 leading-snug font-normal min-h-[40px] placeholder:text-black/40 dark:placeholder:text-white/40 disabled:cursor-not-allowed p-0 border-0 m-0`}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        spellCheck="false"
                    />
                    <div className="text-[11px] text-right text-[#667781] dark:text-[#8696a0] mt-0 flex justify-end items-center gap-1 select-none font-medium h-4">
                        <span>10:45</span>
                        <span className="text-[#53bdeb]"><CheckCheck size={15} strokeWidth={2.5} /></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DEFAULT_REMINDER = "{saludo} {nombre_pila}, te escribo de *{negocio}* para recordarte tu pago de *{servicio}* correspondiente a {mes_actual}.\n\nMonto: *{moneda}{monto}*\n\nAvisame cualquier cosa. Gracias!";
const DEFAULT_CLASS_REMINDER = "Hola {nombre_pila}! Te recuerdo que tenemos cita a las *{hora_inicio}*.\n\nPor favor, confirmame ac\u00E1 si ven\u00EDs: {url_confirmar}\n\nSi necesit\u00E1s cancelar, us\u00E1 este enlace: {url_cancelar}. Nos vemos!";
const DEFAULT_WELCOME = "Hola {nombre_pila}! Te damos la bienvenida a *{negocio}*.\n\nEstamos felices de que te sumes a tus clases de *{servicio}*.\n\nCualquier duda que tengas, pod\u00E9s escribirnos por ac\u00E1. Nos vemos!";
const DEFAULT_GENERAL = "*AVISO IMPORTANTE*\n\n{saludo} {nombre_pila}, te escribimos de *{negocio}* para informarte que:\n\n{mensaje}\n\nSaludos!";

const VAR_DEFS = {
    '{alumno}': 'Nombre completo',
    '{nombre_pila}': 'Primer nombre',
    '{monto}': 'Precio del plan',
    '{negocio}': 'Tu nombre/marca',
    '{servicio}': 'Actividad del alumno',
    '{link}': 'Enlace de pago',
    '{vencimiento}': 'Día de cobro',
    '{mes_actual}': 'Mes en curso',
    '{mes}': 'Mes del período',
    '{moneda}': 'Símbolo moneda',
    '{alias}': 'CBU/CVU o Alias',
    '{pago}': 'Monto cobrado',
    '{saludo}': 'Hola / Buen día',
    '{hora_inicio}': 'Hora de la cita',
    '{url_confirmar}': 'Botón confirmar',
    '{url_cancelar}': 'Botón cancelar',
    '{mensaje}': 'Tu texto libre',
    '{dia}': 'Día de la semana',
    '{fecha}': 'Fecha específica'
};

const AutomationTab: React.FC<AutomationTabProps> = ({ user, setUser, isPro }) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-emerald-50 flex items-center gap-3 mb-2 tracking-tight uppercase">
                <MessageSquare size={24} className="text-primary-main" /> Automatización
            </h2>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Recordatorios automáticos por WhatsApp.</p>
        </div>

        <div className="p-5 md:p-6 lg:p-8 bg-bg-app rounded-[32px] md:rounded-[48px] border border-border-main space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Recordatorios Automáticos</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Notificaciones vía Email y WhatsApp</p>
                </div>
                <button
                    type="button"
                    onClick={() => setUser({ ...user, notificationsEnabled: !user.notificationsEnabled })}
                    className={`w-14 h-8 rounded-full relative transition-all duration-300 p-1 ${user.notificationsEnabled ? 'bg-primary-main' : 'bg-zinc-300 dark:bg-zinc-800'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="h-px bg-zinc-200/50 dark:bg-emerald-500/10" />

            <div>
                <div className="flex items-center justify-between mb-4 ml-4 pr-4">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-widest">Plantilla de WhatsApp (Cobros)</label>
                    <button type="button" onClick={() => setUser({ ...user, reminderTemplate: DEFAULT_REMINDER })} className="text-[10px] font-bold text-zinc-500 hover:text-primary-main transition-colors uppercase tracking-widest flex items-center gap-1"><RotateCcw size={12}/> Restablecer</button>
                </div>
                <WhatsappMessageEditor
                    value={user.reminderTemplate ?? DEFAULT_REMINDER}
                    onChange={(e: any) => setUser({ ...user, reminderTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="mt-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Variables Inteligentes (Tocá para agregar):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {['{alumno}', '{nombre_pila}', '{monto}', '{negocio}', '{servicio}', '{link}', '{vencimiento}', '{mes_actual}', '{mes}', '{moneda}', '{alias}', '{pago}', '{saludo}'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setUser({ ...user, reminderTemplate: (user.reminderTemplate || '') + ' ' + tag })}
                                className="flex flex-col items-start p-3 bg-surface border border-border-main rounded-2xl hover:border-primary-main/40 hover:bg-primary-main/5 transition-all group text-left"
                            >
                                <span className="text-[11px] font-black text-zinc-300 group-hover:text-primary-main uppercase tracking-widest mb-1 transition-colors">
                                    +{tag.replace(/[{}]/g, '')}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 leading-tight">
                                    {VAR_DEFS[tag as keyof typeof VAR_DEFS]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-6 p-4 bg-primary-main/5 rounded-2xl border border-primary-main/10 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg bg-primary-main/10 flex items-center justify-center shrink-0">
                        <MessageSquare size={16} className="text-primary-main" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary-main uppercase tracking-widest mb-1">Dato Clave: {`{alias}`}</p>
                        <p className="text-[11px] font-bold text-text-muted leading-relaxed opacity-70 italic shadow-sm">
                            Esta variable usará siempre el **Alias** que elijas en la sección de "Medios de Pago". Si lo cambias allá, todos tus mensajes se actualizarán automáticamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RECORDATORIO DE CLASES (PRO) --- */}
        <div className="p-5 md:p-6 lg:p-8 bg-bg-app rounded-[32px] md:rounded-[48px] border border-border-main space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Aviso Previo de Clases</h3>
                        <ProFeature featureName="Avisos Automáticos de Clases" inline>
                            <span />
                        </ProFeature>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Avisar:</p>
                        <select
                            disabled={!isPro}
                            value={user.classReminderMinutes || 120}
                            onChange={(e) => setUser({ ...user, classReminderMinutes: parseInt(e.target.value, 10) })}
                            className="bg-surface border border-border-main text-text-main text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1 outline-none focus:border-primary-main/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value={30}>30 mins. antes</option>
                            <option value={60}>1 hora antes</option>
                            <option value={90}>1.5 horas antes</option>
                            <option value={120}>2 horas antes</option>
                            <option value={180}>3 horas antes</option>
                            <option value={240}>4 horas antes</option>
                        </select>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={!isPro}
                    onClick={() => setUser({ ...user, classRemindersEnabled: !user.classRemindersEnabled })}
                    className={`shrink-0 w-14 h-8 rounded-full relative transition-all duration-300 p-1 disabled:opacity-50 disabled:cursor-not-allowed ${user.classRemindersEnabled ? 'bg-primary-main' : 'bg-zinc-300 dark:bg-zinc-800'}`}
                >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${user.classRemindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="h-px bg-zinc-200/50 dark:bg-emerald-500/10" />

            <div>
                <div className="flex items-center justify-between mb-4 ml-4 pr-4">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-widest">Plantilla de WhatsApp (Clases)</label>
                    <button type="button" disabled={!isPro} onClick={() => setUser({ ...user, classReminderTemplate: DEFAULT_CLASS_REMINDER })} className="text-[10px] font-bold text-zinc-500 hover:text-primary-main transition-colors uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"><RotateCcw size={12}/> Restablecer</button>
                </div>
                <WhatsappMessageEditor
                    disabled={!isPro}
                    value={user.classReminderTemplate ?? DEFAULT_CLASS_REMINDER}
                    onChange={(e: any) => setUser({ ...user, classReminderTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="mt-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Variables Inteligentes (Tocá para agregar):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {['{alumno}', '{nombre_pila}', '{hora_inicio}', '{servicio}', '{url_confirmar}', '{url_cancelar}'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                disabled={!isPro}
                                onClick={() => setUser({ ...user, classReminderTemplate: (user.classReminderTemplate || '') + ' ' + tag })}
                                className="flex flex-col items-start p-3 bg-surface border border-border-main rounded-2xl hover:border-primary-main/40 hover:bg-primary-main/5 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-[11px] font-black text-zinc-300 group-hover:text-primary-main uppercase tracking-widest mb-1 transition-colors">
                                    +{tag.replace(/[{}]/g, '')}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 leading-tight">
                                    {VAR_DEFS[tag as keyof typeof VAR_DEFS]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        {/* --- BIENVENIDA --- */}
        <div className="p-5 md:p-6 lg:p-8 bg-bg-app rounded-[32px] md:rounded-[48px] border border-border-main space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Bienvenida a Alumnos</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Mensaje para nuevos inscritos</p>
                </div>
            </div>

            <div className="h-px bg-zinc-200/50 dark:bg-emerald-500/10" />

            <div>
                <div className="flex items-center justify-between mb-4 ml-4 pr-4">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-widest">Plantilla de WhatsApp (Bienvenida)</label>
                    <button type="button" onClick={() => setUser({ ...user, welcomeTemplate: DEFAULT_WELCOME })} className="text-[10px] font-bold text-zinc-500 hover:text-primary-main transition-colors uppercase tracking-widest flex items-center gap-1"><RotateCcw size={12}/> Restablecer</button>
                </div>
                <WhatsappMessageEditor
                    value={user.welcomeTemplate ?? DEFAULT_WELCOME}
                    onChange={(e: any) => setUser({ ...user, welcomeTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="mt-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Variables Inteligentes (Tocá para agregar):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {['{alumno}', '{nombre_pila}', '{negocio}', '{servicio}', '{saludo}'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setUser({ ...user, welcomeTemplate: (user.welcomeTemplate || '') + ' ' + tag })}
                                className="flex flex-col items-start p-3 bg-surface border border-border-main rounded-2xl hover:border-primary-main/40 hover:bg-primary-main/5 transition-all group text-left"
                            >
                                <span className="text-[11px] font-black text-zinc-300 group-hover:text-primary-main uppercase tracking-widest mb-1 transition-colors">
                                    +{tag.replace(/[{}]/g, '')}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 leading-tight">
                                    {VAR_DEFS[tag as keyof typeof VAR_DEFS]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* --- AVISO GENERAL --- */}
        <div className="p-5 md:p-6 lg:p-8 bg-bg-app rounded-[32px] md:rounded-[48px] border border-border-main space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50 uppercase tracking-tight">Aviso General</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Marco base para avisos manuales o cancelaciones</p>
                </div>
            </div>

            <div className="h-px bg-zinc-200/50 dark:bg-emerald-500/10" />

            <div>
                <div className="flex items-center justify-between mb-4 ml-4 pr-4">
                    <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-widest">Plantilla de WhatsApp (Aviso)</label>
                    <button type="button" onClick={() => setUser({ ...user, generalTemplate: DEFAULT_GENERAL })} className="text-[10px] font-bold text-zinc-500 hover:text-primary-main transition-colors uppercase tracking-widest flex items-center gap-1"><RotateCcw size={12}/> Restablecer</button>
                </div>
                <WhatsappMessageEditor
                    value={user.generalTemplate ?? DEFAULT_GENERAL}
                    onChange={(e: any) => setUser({ ...user, generalTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="mt-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Variables Inteligentes (Tocá para agregar):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {['{alumno}', '{nombre_pila}', '{negocio}', '{servicio}', '{mensaje}', '{dia}', '{fecha}', '{saludo}'].map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setUser({ ...user, generalTemplate: (user.generalTemplate || '') + ' ' + tag })}
                                className="flex flex-col items-start p-3 bg-surface border border-border-main rounded-2xl hover:border-primary-main/40 hover:bg-primary-main/5 transition-all group text-left"
                            >
                                <span className="text-[11px] font-black text-zinc-300 group-hover:text-primary-main uppercase tracking-widest mb-1 transition-colors">
                                    +{tag.replace(/[{}]/g, '')}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 leading-tight">
                                    {VAR_DEFS[tag as keyof typeof VAR_DEFS]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default AutomationTab;
