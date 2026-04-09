import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, MoreHorizontal, User, Calendar, 
    FileText, ClipboardList, Trash2, Edit2, PlusCircle
} from 'lucide-react';
import type { Student } from '../../services/api';

interface StudentRowProps {
    student: Student;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    onTogglePayment: (student: Student) => void;
    onOpenModals: (type: string, student: Student) => void;
    currency: string;
}

const StudentRow: React.FC<StudentRowProps> = ({
    student,
    isSelected,
    onToggleSelect,
    onTogglePayment,
    onOpenModals,
    currency
}) => {
    const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <motion.tr 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`group border-b border-border-main/50 hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors ${isSelected ? 'bg-primary-main/5 dark:bg-primary-main/10' : ''}`}
        >
            <td className="py-4 pl-4 pr-3">
                <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(student.id)}
                    className="w-4 h-4 rounded border-border-main text-primary-main focus:ring-primary-main/20 cursor-pointer"
                />
            </td>
            <td className="py-4 px-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm ${
                        student.status === 'paid' ? 'bg-green-500' : 'bg-amber-500'
                    }`}>
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-text-main truncate">{student.name}</p>
                        <p className="text-[10px] font-bold text-text-muted">{student.service_name || 'Sin servicio'}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 px-3 hidden sm:table-cell">
                <button 
                    onClick={() => onTogglePayment(student)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        student.status === 'paid' 
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white' 
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                    }`}
                >
                    {student.status === 'paid' ? 'Al día' : 'Pendiente'}
                </button>
            </td>
            <td className="py-4 px-3 hidden md:table-cell">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-main tabular-nums">
                        {currency}{Number(student.amount).toLocaleString('es-AR')}
                        <span className="text-[10px] text-text-muted ml-1 opacity-60">
                            / {student.planType === 'PACK' ? (student.credits || 0) : (student.classes_per_month || 0)} clases
                        </span>
                    </span>
                    <span className="text-[10px] font-bold text-text-muted">
                        {(student.schedules?.length || 0) === 0 ? (
                            <span className="bg-primary-main/10 text-primary-main px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-tighter">Flexible / Sin horario fijo</span>
                        ) : (
                            `Vence el ${student.due_day || '--'}`
                        )}
                    </span>
                </div>
            </td>
            <td className="py-4 px-3 hidden md:table-cell">
                {student.phone ? (
                    <a 
                        href={`https://wa.me/${student.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500 text-green-600 dark:text-green-400 hover:text-white transition-all text-xs font-bold group"
                    >
                        <MessageCircle size={14} className="transition-transform group-hover:scale-110" />
                        {student.phone}
                    </a>
                ) : (
                    <p className="text-xs font-bold text-text-muted">--</p>
                )}
            </td>
            <td className="py-4 px-3 text-right pr-4">
                <div className="flex items-center justify-end gap-1">
                    <button 
                        onClick={() => onOpenModals('whatsapp', student)}
                        className="p-2 text-text-muted hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="WhatsApp"
                    >
                        <MessageCircle size={16} />
                    </button>
                    <div className="relative group/menu">
                        <button className="p-2 text-text-muted hover:text-primary-main hover:bg-primary-main/10 rounded-lg transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-surface dark:bg-bg-soft border border-border-main rounded-xl shadow-xl z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all py-1">
                            <button onClick={() => onOpenModals('edit', student)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
                                <Edit2 size={14} className="text-text-muted" /> Editar Datos
                            </button>
                            <button onClick={() => onOpenModals('renew', student)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-primary-main hover:bg-primary-main/10 transition-colors text-left">
                                <PlusCircle size={14} /> Cargar Clases (Pack)
                            </button>

                             <button onClick={() => onOpenModals('schedule', student)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
                                <Calendar size={14} className="text-text-muted" /> Ver Horarios
                            </button>
                            <button onClick={() => onOpenModals('history', student)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
                                <ClipboardList size={14} className="text-text-muted" /> Historial Asistencia
                            </button>
                            <button onClick={() => onOpenModals('notes', student)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
                                <FileText size={14} className="text-text-muted" /> Notas Privadas
                            </button>
                            <div className="h-px bg-border-main/50 my-1" />
                            <button onClick={() => onOpenModals('delete', student)} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left">
                                <Trash2 size={14} /> Eliminar Alumno
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        </motion.tr>
    );
};

interface StudentTableProps {
    students: Student[];
    selectedIds: number[];
    onToggleSelect: (id: number) => void;
    onToggleAll: () => void;
    onTogglePayment: (student: Student) => void;
    onOpenModals: (type: string, student: Student) => void;
    currency: string;
}

const StudentTable: React.FC<StudentTableProps> = ({
    students,
    selectedIds,
    onToggleSelect,
    onToggleAll,
    onTogglePayment,
    onOpenModals,
    currency
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Calculate pagination
    const totalPages = Math.ceil(students.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage);
    
    const allSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedIds.includes(s.id));

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="bg-surface dark:bg-bg-soft border border-border-main rounded-[28px] overflow-visible shadow-sm">
            <div className="overflow-x-auto min-h-[600px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-main/50 bg-black/5 dark:bg-white/[0.02]">
                            <th className="py-4 pl-4 pr-3 w-10">
                                <input 
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={onToggleAll}
                                    className="w-4 h-4 rounded border-border-main text-primary-main focus:ring-primary-main/20 cursor-pointer"
                                />
                            </th>
                            <th className="py-4 px-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Alumno</th>
                            <th className="py-4 px-3 text-[10px] font-black text-text-muted uppercase tracking-widest hidden sm:table-cell">Estado Pago</th>
                            <th className="py-4 px-3 text-[10px] font-black text-text-muted uppercase tracking-widest hidden md:table-cell">Monto / Venc.</th>
                            <th className="py-4 px-3 text-[10px] font-black text-text-muted uppercase tracking-widest hidden md:table-cell">Teléfono</th>
                            <th className="py-4 px-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-right pr-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {paginatedStudents.map((student) => (
                                <StudentRow 
                                    key={student.id}
                                    student={student}
                                    isSelected={selectedIds.includes(student.id)}
                                    onToggleSelect={onToggleSelect}
                                    onTogglePayment={onTogglePayment}
                                    onOpenModals={onOpenModals}
                                    currency={currency}
                                />
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            {students.length > 0 && (
                <div className="p-4 border-t border-border-main/50 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, students.length)} de {students.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                currentPage === 1 
                                ? 'opacity-30 cursor-not-allowed text-text-muted' 
                                : 'bg-surface dark:bg-bg-soft text-text-main border border-border-main hover:bg-primary-main/10 hover:text-primary-main'
                            }`}
                        >
                            Anterior
                        </button>
                        <div className="px-3 py-2 rounded-xl bg-primary-main/10 text-primary-main text-[10px] font-black">
                            {currentPage} / {totalPages || 1}
                        </div>
                        <button 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                currentPage === totalPages || totalPages === 0
                                ? 'opacity-30 cursor-not-allowed text-text-muted' 
                                : 'bg-surface dark:bg-bg-soft text-text-main border border-border-main hover:bg-primary-main/10 hover:text-primary-main'
                            }`}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
            {students.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                    <User size={48} className="text-text-muted/20 mb-4" />
                    <h3 className="text-lg font-black text-text-main tracking-tight uppercase">No se encontraron alumnos</h3>
                    <p className="text-sm font-bold text-text-muted mt-1">Probá con otros filtros o creá uno nuevo.</p>
                </div>
            )}
        </div>
    );
};

export default StudentTable;
