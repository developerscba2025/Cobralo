import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search, Loader2, Plus, Trash2, Check, UserPlus } from 'lucide-react';
import { api, Student, UnifiedSchedule } from '../services/api';
import { showToast } from './Toast';

interface ClassParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: UnifiedSchedule | null;
    onSuccess: () => void;
}

const ClassParticipantsModal = ({ isOpen, onClose, schedule, onSuccess }: ClassParticipantsModalProps) => {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Local state for current schedule's student IDs
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [capacity, setCapacity] = useState<number | ''>('');

    useEffect(() => {
        if (isOpen && schedule) {
            setSelectedIds((schedule.students || [schedule.student]).filter(Boolean).map(s => s!.id));
            setCapacity(schedule.capacity || '');
            loadStudents();
        }
    }, [isOpen, schedule]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await api.getStudents();
            setAllStudents(data);
        } catch (error) {
            console.error('Error loading students:', error);
            showToast.error('Error al cargar alumnos');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (studentId: number) => {
        setSelectedIds(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const handleSave = async () => {
        if (!schedule) return;
        setIsSaving(true);
        try {
            // Update the schedule with the new set of student IDs and capacity
            await api.updateSchedule(schedule.id, {
                studentIds: selectedIds,
                capacity: capacity === '' ? null : Number(capacity)
            });
            showToast.success('Clase actualizada correctamente');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving participants:', error);
            showToast.error('Error al actualizar la clase');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredStudents = allStudents.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!schedule) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-bg-soft w-full max-w-lg rounded-[40px] p-8 shadow-2xl border border-zinc-100 dark:border-border-main flex flex-col max-h-[90vh]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic">Integrantes de Clase</h2>
                            <p className="text-text-muted mt-2 font-medium tracking-tight">
                                {schedule.startTime} - {schedule.endTime} | {selectedIds.length} alumnos
                            </p>
                        </div>

                        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar alumnos..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-bg-app dark:bg-bg-dark border border-border-main rounded-2xl outline-none focus:ring-2 focus:ring-primary-main/20 text-sm font-bold"
                                />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <input
                                    type="number"
                                    placeholder="Cupo (opcional)"
                                    value={capacity}
                                    onChange={e => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full pl-12 pr-4 py-3 bg-bg-app dark:bg-bg-dark border border-border-main rounded-2xl outline-none focus:ring-2 focus:ring-primary-main/20 text-sm font-bold"
                                />
                            </div>
                        </div>

                        {capacity !== '' && selectedIds.length > Number(capacity) && (
                            <div className="mb-4 flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                <AlertCircle size={18} className="text-amber-500 shrink-0" />
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight leading-tight">
                                    ¡Atención! Has seleccionado más alumnos que la capacidad permitida ({selectedIds.length} / {capacity}).
                                </p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center py-12 gap-3">
                                    <Loader2 className="animate-spin text-primary-main" size={24} />
                                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Cargando lista...</span>
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center py-12 opacity-50">
                                    <Users className="mx-auto mb-2" size={32} />
                                    <p className="text-xs font-bold">No se encontraron alumnos</p>
                                </div>
                            ) : filteredStudents.map(student => {
                                const isSelected = selectedIds.includes(student.id);
                                return (
                                    <button
                                        key={student.id}
                                        onClick={() => handleToggle(student.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${
                                            isSelected 
                                                ? 'bg-primary-main/5 border-primary-main/20' 
                                                : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-bg-dark'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                                                isSelected ? 'bg-primary-main text-white' : 'bg-zinc-100 dark:bg-bg-dark text-zinc-500'
                                            }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                                <div className={`text-sm font-bold ${isSelected ? 'text-primary-main' : 'text-text-main'}`}>
                                                    {student.name}
                                                </div>
                                                <div className="text-[10px] font-black uppercase text-text-muted opacity-80 tracking-widest">
                                                    {student.service_name}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                            isSelected 
                                                ? 'bg-primary-main border-primary-main text-white shadow-lg shadow-primary-glow' 
                                                : 'bg-transparent border-zinc-200 dark:border-border-emerald'
                                        }`}>
                                            {isSelected && <Check size={14} strokeWidth={4} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || selectedIds.length === 0}
                                className="w-full bg-primary-main hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-5 rounded-3xl shadow-xl shadow-primary-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <><Loader2 className="animate-spin" size={20} /> Guardando...</>
                                ) : (
                                    'ACTUALIZAR INTEGRANTES'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ClassParticipantsModal;
