import React from 'react';
import { motion } from 'framer-motion';
import { Search, Check, Minus, Plus, Calendar, Clock } from 'lucide-react';
import { type Student } from '../../../services/api';

interface AgendaStepProps {
    formData: Partial<Student>;
    setFormData: (data: any) => void;
    agendaMode: 'custom' | 'existing';
    setAgendaMode: (mode: 'custom' | 'existing') => void;
    groupSearchTerm: string;
    setGroupSearchTerm: (term: string) => void;
    existingSchedules: any[];
    formSchedules: { dayOfWeek: number; startTime: string; endTime: string }[];
    setFormSchedules: (s: any | ((prev: any[]) => any[])) => void;
    configType: string;
    weeklyFrequency: number;
    user: any;
    onBack: () => void;
    onSubmit: (e: any) => void;
    loading: boolean;
    student?: any;
    cur: string;
    amt: number;
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_LABEL: Record<number, string> = { 1: 'LUN', 2: 'MAR', 3: 'MIÉ', 4: 'JUE', 5: 'VIE', 6: 'SÁB', 0: 'DOM' };
const DAY_FULL: Record<number, string> = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };

const AgendaStep: React.FC<AgendaStepProps> = ({
    formData, setFormData, agendaMode, setAgendaMode, groupSearchTerm, setGroupSearchTerm, existingSchedules, formSchedules, setFormSchedules, configType, weeklyFrequency, user, onBack, onSubmit, loading, student, cur, amt
}) => {
    
    const toggleDay = (day: number) => {
        setFormSchedules((prev: any[]) => {
            const exists = prev.find(s => s.dayOfWeek === day);
            if (exists) return prev.filter(s => s.dayOfWeek !== day);
            if (configType === 'weeks' && prev.length >= weeklyFrequency) {
                return prev;
            }
            const startH = user?.workStartHour ?? 8;
            return [...prev, {
                dayOfWeek: day,
                startTime: `${String(startH).padStart(2, '0')}:00`,
                endTime: `${String(startH + 1).padStart(2, '0')}:00`
            }];
        });
    };

    const adjustDayTime = (day: number, part: 'h' | 'm', delta: number) => {
        setFormSchedules((prev: any[]) => prev.map(s => {
            if (s.dayOfWeek !== day) return s;
            let [h, m] = s.startTime.split(':').map(Number);
            if (part === 'h') h = (h + delta + 24) % 24;
            else m = (m + delta + 60) % 60;
            return { ...s, startTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
        }));
    };

    return (
        <motion.div
            key="step3"
            className="grid lg:grid-cols-[1fr_400px] min-h-full h-full overflow-y-auto lg:overflow-hidden"
        >
            <div className="p-5 md:p-8 space-y-6 lg:h-full lg:overflow-y-auto custom-scrollbar">
                {/* Header + mode toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-white/5">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/50 mb-2">Protocolo de Asistencia</p>
                        <h3 className="text-3xl font-black text-text-main uppercase tracking-tighter leading-none">Definir Agenda</h3>
                    </div>
                    <div className="flex p-2 bg-white/5 rounded-[24px] border border-white/5 self-start sm:self-auto shadow-2xl">
                        {(['custom', 'existing'] as const).map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setAgendaMode(mode)}
                                className={`px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${agendaMode === mode ? 'bg-emerald-500 text-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-105' : 'text-text-muted hover:text-text-main'}`}
                            >
                                {mode === 'custom' ? 'Personalizada' : 'Unirse a Grupo'}
                            </button>
                        ))}
                    </div>
                </div>

                {agendaMode === 'existing' ? (
                    /* Existing groups */
                    <div className="space-y-8 pt-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted/20 group-focus-within:text-emerald-500 transition-all duration-500" />
                            <input
                                type="text"
                                placeholder="Buscar por grupo, actividad o día..."
                                className="w-full bg-white/5 border border-white/5 focus:border-emerald-500/20 rounded-[28px] pl-14 pr-8 py-5 text-base font-bold outline-none transition-all duration-500 text-text-main placeholder:text-text-muted/10 shadow-inner"
                                value={groupSearchTerm}
                                onChange={e => setGroupSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[440px] overflow-y-auto custom-scrollbar pr-3">
                            {existingSchedules
                                .filter(s => {
                                    const students = s.students || (s.student ? [s.student] : []);
                                    const names = students.map((st: any) => st?.name || '').join(' ').toLowerCase();
                                    const service = (students[0]?.service_name || '').toLowerCase();
                                    const DAYS_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                                    const day = DAYS_MAP[s.dayOfWeek === 7 ? 0 : s.dayOfWeek].toLowerCase();
                                    const search = groupSearchTerm.toLowerCase();
                                    return names.includes(search) || service.includes(search) || day.includes(search);
                                })
                                .map((s, idx) => {
                                    const isSelected = formSchedules.some(fs => fs.dayOfWeek === s.dayOfWeek && fs.startTime === s.startTime);
                                    const participants = s.students || (s.student ? [s.student] : []);
                                    const service = participants[0]?.service_name || 'General';
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setFormSchedules([{ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }]);
                                                if (participants[0]) setFormData((p: any) => ({ ...p, service_name: service }));
                                            }}
                                            className={`flex items-center gap-6 p-6 rounded-[32px] border-2 text-left transition-all duration-500 ${isSelected ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_20px_40px_rgba(16,185,129,0.05)] scale-[1.02]' : 'border-border-main bg-surface/50 dark:bg-white/5 hover:border-emerald-500/20'}`}
                                        >
                                            <div className={`w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/20' : 'bg-bg-app dark:bg-white/5 text-text-muted'}`}>
                                                <span className="text-[10px] font-black leading-none mb-1.5 opacity-60">
                                                    {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][s.dayOfWeek === 7 ? 0 : s.dayOfWeek]}
                                                </span>
                                                <span className="text-xl font-black">{s.startTime.split(':')[0]}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-black uppercase tracking-tight truncate">{service}</p>
                                                <p className="text-[11px] text-text-muted font-bold mt-1.5 opacity-40">{s.startTime} hs · {participants.length} alumno{participants.length !== 1 ? 's' : ''}</p>
                                            </div>
                                            {isSelected && <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]"><Check size={16} className="text-black" strokeWidth={4} /></div>}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                ) : (
                    /* Custom agenda */
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-emerald-500 rounded-full opacity-20" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/60">Configuración por días</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newFlex = !formData.isFlexible;
                                    setFormData((p: any) => ({ ...p, isFlexible: newFlex }));
                                    if (newFlex) setFormSchedules([]);
                                }}
                                className={`flex items-center gap-3 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${formData.isFlexible ? 'bg-emerald-500 border-emerald-500/50 text-black shadow-[0_10px_25px_rgba(16,185,129,0.2)]' : 'border-white/10 text-text-muted hover:border-emerald-500/40 hover:text-emerald-500'}`}
                            >
                                <div className={`w-2.5 h-2.5 rounded-full ${formData.isFlexible ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]' : 'bg-emerald-500/20'}`} />
                                {formData.isFlexible ? 'Modo Flexible Activo' : 'Activar Horario Flexible'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {DAY_ORDER.map(day => {
                                const active = formSchedules.some(s => s.dayOfWeek === day);
                                const schedule = formSchedules.find(s => s.dayOfWeek === day);
                                return (
                                    <div
                                        key={day}
                                        onClick={() => !formData.isFlexible && toggleDay(day)}
                                        className={`flex items-center justify-between px-5 py-3.5 rounded-[20px] border cursor-pointer select-none transition-all duration-500 group relative overflow-hidden ${
                                            active
                                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_5px_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20'
                                                : 'bg-surface/30 dark:bg-white/5 border-border-main hover:border-emerald-500/20 hover:-translate-y-0.5'
                                        } ${formData.isFlexible ? 'opacity-20 pointer-events-none grayscale scale-95' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center border transition-all duration-500 ${active ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-bg-app dark:bg-white/5 border-border-main text-text-muted group-hover:border-emerald-500/30 group-hover:text-emerald-500'}`}>
                                                {active ? <Check size={18} strokeWidth={4} /> : <span className="text-[10px] font-black">{DAY_LABEL[day]}</span>}
                                            </div>
                                            <span className={`text-sm font-black uppercase tracking-widest transition-colors ${active ? 'text-emerald-500' : 'text-text-main group-hover:text-emerald-400'}`}>
                                                {DAY_FULL[day]}
                                            </span>
                                        </div>

                                        {active && schedule ? (
                                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center bg-bg-app dark:bg-white/5 border border-border-main dark:border-white/10 rounded-[12px] p-1 shadow-inner">
                                                    <button type="button" onClick={() => adjustDayTime(day, 'h', -1)} className="text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md p-1.5 transition-colors"><Minus size={12} strokeWidth={3} /></button>
                                                    <span className="w-8 text-center text-emerald-500 font-black text-sm tabular-nums tracking-wider">{schedule.startTime.split(':')[0]}</span>
                                                    <button type="button" onClick={() => adjustDayTime(day, 'h', 1)} className="text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md p-1.5 transition-colors"><Plus size={12} strokeWidth={3} /></button>
                                                </div>
                                                <span className="text-text-muted/30 font-black text-sm pb-1">:</span>
                                                <div className="flex items-center bg-bg-app dark:bg-white/5 border border-border-main dark:border-white/10 rounded-[12px] p-1 shadow-inner">
                                                    <button type="button" onClick={() => adjustDayTime(day, 'm', -15)} className="text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md p-1.5 transition-colors"><Minus size={12} strokeWidth={3} /></button>
                                                    <span className="w-8 text-center text-emerald-500 font-black text-sm tabular-nums tracking-wider">{schedule.startTime.split(':')[1]}</span>
                                                    <button type="button" onClick={() => adjustDayTime(day, 'm', 15)} className="text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md p-1.5 transition-colors"><Plus size={12} strokeWidth={3} /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-white/5 group-hover:bg-emerald-500/10 transition-colors">
                                                <Plus size={18} className="text-text-muted/20 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Final Confirmation */}
            <div className="border-l border-border-main/60 p-6 md:p-8 flex flex-col bg-emerald-500/[0.03]">
                <div className="mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 mb-2">Revisión Final</p>
                    <h4 className="text-text-main font-black text-xl md:text-2xl uppercase tracking-tighter">Resumen de Alta</h4>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/5 space-y-3">
                        {[
                            { icon: <Plus size={14} />, label: 'Alumno', value: formData.name || '—', hi: false },
                            { icon: <Calendar size={14} />, label: 'Plan', value: configType === 'unique' ? 'Suelto' : configType === 'weeks' ? 'Mensual (Sem)' : 'Mensual (Pack)', hi: true },
                            { icon: <Clock size={14} />, label: 'Agenda', value: formData.isFlexible ? 'Flexible' : (formSchedules.length > 0 ? `${formSchedules.length} clases/sem` : 'Sin días set'), hi: false },
                            { icon: <Plus size={14} />, label: 'Total', value: `${cur}${amt.toLocaleString('es-AR')}`, hi: true },
                        ].map(row => (
                            <div key={row.label} className="flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted/50">{row.label}</span>
                                <span className={`text-sm font-black uppercase tracking-tight truncate ${row.hi ? 'text-emerald-500' : 'text-text-main'}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    {formSchedules.length > 0 && !formData.isFlexible && (
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest ml-1">Horarios Confirmados</p>
                            <div className="flex flex-wrap gap-2">
                                {formSchedules.map(s => (
                                    <div key={s.dayOfWeek} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                                        <span className="text-[9px] font-black text-emerald-500 uppercase">{DAY_LABEL[s.dayOfWeek]}</span>
                                        <span className="text-[9px] font-bold text-text-main/60">{s.startTime}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-6">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onSubmit}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black uppercase tracking-widest text-xs rounded-[20px] shadow-[0_20px_40px_rgba(16,185,129,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3 overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? (
                                <><div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" /> Procesando...</>
                            ) : (
                                student ? 'Guardar Cambios' : 'Confirmar Alta'
                            )}
                        </span>
                    </button>
                    <button type="button" onClick={onBack} className="w-full text-center text-[10px] font-black text-text-muted/40 hover:text-text-muted uppercase tracking-widest transition-colors py-2">
                        ← Revisar Liquidación
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AgendaStep;
