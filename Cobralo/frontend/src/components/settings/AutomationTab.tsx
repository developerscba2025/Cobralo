import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
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
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-4 ml-4 tracking-widest">Plantilla de WhatsApp (Cobros)</label>
                <AutoResizeTextarea
                    className="w-full p-4 md:p-6 lg:p-8 bg-surface text-text-main rounded-[20px] lg:rounded-[32px] border-none focus:ring-2 focus:ring-primary-main/20 outline-none font-bold text-text-main shadow-sm min-h-[140px] leading-relaxed"
                    value={user.reminderTemplate ?? "Hola {alumno}, te escribo para recordarte que tenés pendiente el pago de {servicio} por {monto}. Avisame cualquier cosa. ¡Gracias!"}
                    onChange={e => setUser({ ...user, reminderTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    {['{alumno}', '{monto}', '{negocio}', '{servicio}', '{link}', '{vencimiento}', '{mes}', '{moneda}', '{alias}', '{pago}'].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setUser({ ...user, reminderTemplate: (user.reminderTemplate || '') + ' ' + tag })}
                            className="px-4 py-2 bg-surface border border-border-main rounded-xl text-[10px] font-black text-zinc-400 hover:text-primary-main hover:border-primary-main/30 transition-all uppercase tracking-widest"
                        >
                            +{tag.replace(/[{}]/g, '')}
                        </button>
                    ))}
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
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-4 ml-4 tracking-widest">Plantilla de WhatsApp (Clases)</label>
                <AutoResizeTextarea
                    disabled={!isPro}
                    className="w-full p-4 md:p-6 lg:p-8 bg-surface text-text-main rounded-[20px] lg:rounded-[32px] border-none focus:ring-2 focus:ring-primary-main/20 outline-none font-bold text-text-main shadow-sm min-h-[140px] leading-relaxed disabled:opacity-50 transition-all"
                    value={user.classReminderTemplate ?? "Hola {alumno}, te recuerdo que tenemos clase a las {hora_inicio}. Por favor, confirmame acá si venís: {url_confirmar}\n\nSi se te complica y necesitás cancelar, usá este enlace: {url_cancelar}. ¡Nos vemos!"}
                    onChange={e => setUser({ ...user, classReminderTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    {['{alumno}', '{hora_inicio}', '{servicio}', '{url_confirmar}', '{url_cancelar}'].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            disabled={!isPro}
                            onClick={() => setUser({ ...user, classReminderTemplate: (user.classReminderTemplate || '') + ' ' + tag })}
                            className="px-4 py-2 bg-surface border border-border-main rounded-xl text-[10px] font-black text-zinc-400 hover:text-primary-main hover:border-primary-main/30 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +{tag.replace(/[{}]/g, '')}
                        </button>
                    ))}
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
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-4 ml-4 tracking-widest">Plantilla de WhatsApp (Bienvenida)</label>
                <AutoResizeTextarea
                    className="w-full p-4 md:p-6 lg:p-8 bg-surface text-text-main rounded-[20px] lg:rounded-[32px] border-none focus:ring-2 focus:ring-primary-main/20 outline-none font-bold text-text-main shadow-sm min-h-[140px] leading-relaxed transition-all"
                    value={user.welcomeTemplate ?? "✨ ¡Hola {alumno}! Te damos la bienvenida oficial a {negocio}.\n\nEstamos muy felices de que te sumes a nuestras clases de {servicio}.\n\nCualquier duda que tengas, podés escribirnos por acá. ¡Nos vemos en clase! 🚀"}
                    onChange={e => setUser({ ...user, welcomeTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    {['{alumno}', '{negocio}', '{servicio}'].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setUser({ ...user, welcomeTemplate: (user.welcomeTemplate || '') + ' ' + tag })}
                            className="px-4 py-2 bg-surface border border-border-main rounded-xl text-[10px] font-black text-zinc-400 hover:text-primary-main hover:border-primary-main/30 transition-all uppercase tracking-widest"
                        >
                            +{tag.replace(/[{}]/g, '')}
                        </button>
                    ))}
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
                <label className="block text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase mb-4 ml-4 tracking-widest">Plantilla de WhatsApp (Aviso)</label>
                <AutoResizeTextarea
                    className="w-full p-4 md:p-6 lg:p-8 bg-surface text-text-main rounded-[20px] lg:rounded-[32px] border-none focus:ring-2 focus:ring-primary-main/20 outline-none font-bold text-text-main shadow-sm min-h-[140px] leading-relaxed transition-all"
                    value={user.generalTemplate ?? "📢 *AVISO IMPORTANTE*\n\nHola {alumno}, te escribimos de {negocio} para informarte lo siguiente:\n\n{mensaje}\n\n¡Saludos!"}
                    onChange={e => setUser({ ...user, generalTemplate: e.target.value })}
                    placeholder="Escribí tu mensaje acá..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    {['{alumno}', '{negocio}', '{servicio}', '{mensaje}', '{dia}', '{fecha}'].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setUser({ ...user, generalTemplate: (user.generalTemplate || '') + ' ' + tag })}
                            className="px-4 py-2 bg-surface border border-border-main rounded-xl text-[10px] font-black text-zinc-400 hover:text-primary-main hover:border-primary-main/30 transition-all uppercase tracking-widest"
                        >
                            +{tag.replace(/[{}]/g, '')}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default AutomationTab;
