import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Plus, Users, Clock, Check, Search, 
    BookOpen, Palette, ChevronRight, ChevronLeft,
    Loader2, AlertCircle, Trash2
} from 'lucide-react';
import { api } from '../services/api';
import type { Group, Student, UserService } from '../services/api';
import { showToast } from './Toast';

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    group?: Group | null;
    onSuccess: () => void;
}

const COLORS = [
    { name: 'Esmeralda', value: '#10b981' },
    { name: 'Cielo', value: '#0ea5e9' },
    { name: 'Violeta', value: '#8b5cf6' },
    { name: 'Ámbar', value: '#f59e0b' },
    { name: 'Rosa', value: '#f43f5e' },
    { name: 'Índigo', value: '#6366f1' },
    { name: 'Cian', value: '#06b6d4' },
    { name: 'Naranja', value: '#f97316' },
];

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const GroupModal = ({ isOpen, onClose, group, onSuccess }: GroupModalProps) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [services, setServices] = useState<UserService[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [serviceId, setServiceId] = useState<number | undefined>(undefined);
    const [capacity, setCapacity] = useState<number>(10);
    const [color, setColor] = useState(COLORS[0].value);
    const [subcategory, setSubcategory] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadData();
            if (group) {
                setName(group.name);
                setServiceId(group.serviceId || undefined);
                setCapacity(group.capacity || 10);
                setColor(group.color || COLORS[0].value);
                setSubcategory(group.subcategory || '');
                setNotes(group.notes || '');
                setSelectedStudentIds(group.students.map(s => s.id));
                setStep(1);
            } else {
                setName('');
                setServiceId(undefined);
                setCapacity(10);
                setColor(COLORS[0].value);
                setSubcategory('');
                setNotes('');
                setSelectedStudentIds([]);
                setStep(1);
            }
        }
    }, [isOpen, group]);

    const loadData = async () => {
        try {
            const [studentsData, servicesData] = await Promise.all([
                api.getStudents(),
                api.getServices()
            ]);
            setStudents(studentsData);
            setServices(servicesData);
        } catch (error) {
            showToast.error('Error al cargar datos');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast.error('El nombre es obligatorio');
            return;
        }

        setIsLoading(true);
        try {
            if (group) {
                await api.updateGroup(group.id, {
                    name,
                    serviceId,
                    capacity,
                    color,
                    subcategory,
                    notes
                });
                // Update students separately if changed
                const currentIds = group.students.map(s => s.id);
                const toAdd = selectedStudentIds.filter(id => !currentIds.includes(id));
                const toRemove = currentIds.filter(id => !selectedStudentIds.includes(id));

                if (toAdd.length > 0) await api.addStudentsToGroup(group.id, toAdd);
                for (const id of toRemove) await api.removeStudentFromGroup(group.id, id);

                showToast.success('Grupo actualizado');
            } else {
                await api.createGroup({
                    name,
                    serviceId,
                    capacity,
                    color,
                    subcategory,
                    notes,
                    studentIds: selectedStudentIds
                });
                showToast.success('Grupo creado con éxito');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast.error(error.message || 'Error al guardar el grupo');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm)
    );

    const toggleStudent = (id: number) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 modal-overlay">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-premium rounded-[40px] w-full max-w-xl relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-border-main"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-8 border-b border-border-main flex justify-between items-start bg-white/5">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    {group ? 'Editar Grupo' : 'Nuevo Grupo'}
                                </span>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
                                    Paso {step} de 2
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase italic leading-none">
                                {group ? name || 'Sin nombre' : 'Crear Grupo'}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-3 text-text-muted hover:text-text-main hover:bg-white/5 rounded-2xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Stepper Content */}
                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    {/* Identidad */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Nombre del Grupo</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    placeholder="Ej: Yoga Martes y Jueves"
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-border-main text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Servicio Relacionado</label>
                                                <select
                                                    value={serviceId}
                                                    onChange={e => setServiceId(Number(e.target.value))}
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-border-main text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                                >
                                                    <option value="">Seleccionar Servicio</option>
                                                    {services.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Subcategoría (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={subcategory}
                                                    onChange={e => setSubcategory(e.target.value)}
                                                    placeholder="Ej: Hatha Yoga, Flow, etc."
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-border-main text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Cupo Máximo</label>
                                                <input
                                                    type="number"
                                                    value={capacity}
                                                    onChange={e => setCapacity(Number(e.target.value))}
                                                    className="w-full p-4 rounded-2xl bg-white/5 border border-border-main text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Color Distintivo</label>
                                                <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 border border-border-main rounded-2xl">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c.value}
                                                            type="button"
                                                            onClick={() => setColor(c.value)}
                                                            className={`w-8 h-8 rounded-xl transition-all flex items-center justify-center ${color === c.value ? 'scale-110 ring-2 ring-white/20' : 'opacity-40 hover:opacity-100'}`}
                                                            style={{ backgroundColor: c.value }}
                                                        >
                                                            {color === c.value && <Check size={14} className="text-white" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Notas (Opcional)</label>
                                            <textarea
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                placeholder="Detalles sobre el nivel, requisitos o materiales..."
                                                rows={3}
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-border-main text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-black text-text-main uppercase tracking-widest italic">Seleccionar Alumnos</h3>
                                            <p className="text-[10px] text-text-muted font-bold uppercase mt-1">{selectedStudentIds.length} seleccionados</p>
                                        </div>
                                        <div className="relative w-48">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Buscar..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-border-main rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredStudents.length === 0 ? (
                                            <div className="col-span-full py-12 text-center bg-white/5 border border-dashed border-border-main rounded-3xl">
                                                <Users className="mx-auto mb-2 opacity-20" size={32} />
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">No se encontraron alumnos</p>
                                            </div>
                                        ) : (
                                            filteredStudents.map(student => (
                                                <button
                                                    key={student.id}
                                                    onClick={() => toggleStudent(student.id)}
                                                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${selectedStudentIds.includes(student.id) ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-border-main text-text-muted hover:border-emerald-500/30'}`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 text-left">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${selectedStudentIds.includes(student.id) ? 'bg-emerald-500 text-white' : 'bg-white/10 text-text-muted'}`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold truncate leading-tight">{student.name}</p>
                                                            <p className="text-[9px] opacity-60 font-medium truncate">{student.service_name || 'Sin servicio'}</p>
                                                        </div>
                                                    </div>
                                                    {selectedStudentIds.includes(student.id) && <Check size={14} />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-white/5 border-t border-border-main flex justify-between items-center">
                        <div>
                            {step === 2 && (
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-main transition-all"
                                >
                                    <ChevronLeft size={16} /> Volver
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {step === 1 ? (
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 bg-text-main text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 transition-all shadow-xl shadow-black/20"
                                >
                                    Siguiente <ChevronRight size={16} strokeWidth={3} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} strokeWidth={3} />}
                                    {group ? 'Guardar Cambios' : 'Crear Grupo'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GroupModal;
