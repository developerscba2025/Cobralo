import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTodo, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { Student } from '../../services/api';

interface Reminder {
    id: string;
    text: string;
    done: boolean;
    studentId?: number;
    dueDate?: string;
}

interface DashboardRemindersProps {
    reminders: Reminder[];
    students: Student[];
    newReminder: string;
    setNewReminder: (val: string) => void;
    selectedStudentId: number | null;
    setSelectedStudentId: (id: number | null) => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    onAdd: () => void;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
}

const DashboardReminders: React.FC<DashboardRemindersProps> = ({
    reminders,
    students,
    newReminder,
    setNewReminder,
    selectedStudentId,
    setSelectedStudentId,
    selectedDate,
    setSelectedDate,
    onAdd,
    onToggle,
    onRemove
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onAdd();
    };

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-border-main transition-all duration-300 bg-surface dark:bg-bg-soft shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-5 md:p-7 flex flex-col h-full">
            <h3 className="text-xs font-black text-text-main uppercase tracking-widest flex items-center justify-between mb-5">
                <span className="flex items-center gap-2">
                    Recordatorios
                    {reminders.some(r => !r.done) && (
                        <span className="bg-primary-main text-white text-[9px] px-1.5 py-0.5 rounded-full">
                            {reminders.filter(r => !r.done).length}
                        </span>
                    )}
                </span>
                <ListTodo size={14} className="text-text-muted" />
            </h3>

            <div className="space-y-2 mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Plus size={14} className="text-text-muted" />
                    </div>
                    <input 
                        type="text"
                        value={newReminder}
                        onChange={(e) => setNewReminder(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nueva tarea... (Enter)"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-main/30 transition-all"
                    />
                </div>
                {newReminder.trim() && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                            <select 
                                value={selectedStudentId || ''}
                                onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : null)}
                                className="appearance-none w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-text-main outline-none focus:ring-2 focus:ring-primary-main/30 cursor-pointer pr-8 uppercase tracking-widest"
                            >
                                <option value="">Asociar Alumno...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative w-32">
                            <input 
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="appearance-none w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] font-black text-text-main outline-none focus:ring-2 focus:ring-primary-main/30 cursor-pointer uppercase tracking-widest [color-scheme:dark]"
                            />
                        </div>

                        <button 
                            onClick={onAdd}
                            className="p-2 bg-primary-main text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-main/20 flex items-center justify-center shrink-0"
                        >
                            <Plus size={14} />
                        </button>
                    </motion.div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] pr-2 space-y-2 pb-2">
                <AnimatePresence>
                    {reminders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center text-text-muted py-6"
                        >
                            <ListTodo size={24} className="mb-2 opacity-20" />
                            <p className="text-[11px] font-bold">No hay recordatorios pendientes.</p>
                        </motion.div>
                    ) : (
                        reminders.map(reminder => {
                            const student = students.find(s => s.id === reminder.studentId);
                            const todayStr = new Date().toISOString().split('T')[0];
                            const isToday = reminder.dueDate === todayStr;
                            const isOverdue = reminder.dueDate && reminder.dueDate < todayStr && !reminder.done;

                            return (
                                <motion.div 
                                    key={reminder.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                        reminder.done 
                                            ? 'bg-transparent border-transparent opacity-50 grayscale' 
                                            : 'bg-black/5 dark:bg-white/[0.07] border-black/8 dark:border-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.12]'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => onToggle(reminder.id)}>
                                        <div className="mt-0.5 shrink-0">
                                            {reminder.done ? (
                                                <CheckCircle2 size={16} className="text-primary-main" />
                                            ) : (
                                                <div className={`w-4 h-4 rounded-full border-2 transition-colors ${isToday ? 'border-amber-500 animate-pulse' : isOverdue ? 'border-red-500' : 'border-text-muted/50 group-hover:border-primary-main'}`} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate transition-all ${reminder.done ? 'text-text-muted line-through' : 'text-text-main'}`}>
                                                {reminder.text}
                                            </p>
                                            {(student || reminder.dueDate) && (
                                                <div className="flex gap-2 mt-1">
                                                    {student && (
                                                        <span className="text-[9px] font-black uppercase text-primary-main py-0.5 px-1.5 bg-primary-main/10 rounded-md">
                                                            {student.name.split(' ')[0]}
                                                        </span>
                                                    )}
                                                    {reminder.dueDate && (
                                                        <span className={`text-[9px] font-black uppercase py-0.5 px-1.5 rounded-md ${isToday ? 'bg-amber-500/10 text-amber-500 animate-pulse' : isOverdue ? 'bg-red-500/10 text-red-500' : 'bg-black/10 dark:bg-white/10 text-text-muted'}`}>
                                                            {isToday ? 'Hoy' : reminder.dueDate}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onRemove(reminder.id)}
                                        className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DashboardReminders;
