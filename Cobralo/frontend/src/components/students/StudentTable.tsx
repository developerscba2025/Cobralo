import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, MoreHorizontal, User, Calendar, 
    FileText, ClipboardList, Trash2, Edit2, PlusCircle, X
} from 'lucide-react';
import type { Student } from '../../services/api';

interface StudentRowProps {
    student: Student;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    onTogglePayment: (student: Student) => void;
    onOpenModals: (type: string, student: Student) => void;
    onOpenActionMenu: (student: Student) => void;
    currency: string;
}

const StudentRow: React.FC<StudentRowProps> = ({
    student,
    isSelected,
    onToggleSelect,
    onTogglePayment,
    onOpenModals,
    onOpenActionMenu,
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
                    <div className="relative">
                        <button onClick={() => onOpenActionMenu(student)} className="p-2 text-text-muted hover:text-primary-main hover:bg-primary-main/10 rounded-lg transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
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

    const [actionModal, setActionModal] = useState<{isOpen: boolean, student: Student | null}>({isOpen: false, student: null});
    const handleCloseActionMenu = () => setActionModal({isOpen: false, student: null});

    const handleActionClick = (type: string) => {
        if (actionModal.student) {
            onOpenModals(type, actionModal.student);
        }
        handleCloseActionMenu();
    };

    return (
        <>
            <div className="bg-surface dark:bg-bg-soft border border-border-main rounded-[28px] overflow-hidden shadow-sm relative flex flex-col">
            <div className="relative flex-1">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-main/50 bg-black/5 dark:bg-white/[0.02] sticky top-0 z-10 bg-surface dark:bg-bg-soft">
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
                                        onOpenActionMenu={(s) => setActionModal({isOpen: true, student: s})}
                                        currency={currency}
                                    />
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                
                {/* Bottom Scroll Fade Removed */}
            </div>

            {students.length > 0 && (
                <div className="relative z-20 p-4 border-t border-border-main/50 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
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

        {/* Global Action Menu Popup */}
        <AnimatePresence>
            {actionModal.isOpen && actionModal.student && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
                    <motion.div 
                        initial={{opacity: 0}} 
                        animate={{opacity: 1}} 
                        exit={{opacity: 0}} 
                        onClick={handleCloseActionMenu} 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                    />
                    <motion.div 
                        initial={{opacity: 0, y: 50, scale: 0.95}} 
                        animate={{opacity: 1, y: 0, scale: 1}} 
                        exit={{opacity: 0, y: 50, scale: 0.95}} 
                        className="relative bg-surface dark:bg-bg-soft border border-border-main rounded-[40px] sm:rounded-[32px] shadow-2xl w-full sm:w-[420px] overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-border-main flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
                            <div>
                                <h3 className="font-black text-text-main text-xl tracking-tight truncate pr-4 uppercase italic italic-none">{actionModal.student.name}</h3>
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted mt-1 opacity-60">Opciones de Alumno</p>
                            </div>
                            <button onClick={handleCloseActionMenu} className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                            <button onClick={() => handleActionClick('edit')} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 group-hover:scale-110 transition-transform"><Edit2 size={18} className="text-text-main" /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-text-main uppercase tracking-tight">Editar Datos</span>
                                    <p className="text-[10px] font-bold text-text-muted opacity-50 uppercase tracking-widest mt-0.5">Modificar información personal</p>
                                </div>
                            </button>
                            <button onClick={() => handleActionClick('renew')} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl bg-primary-main/5 hover:bg-primary-main/10 transition-all text-left group border border-primary-main/10">
                                <div className="p-3 rounded-2xl bg-primary-main text-white group-hover:scale-110 transition-transform"><PlusCircle size={18} /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-primary-main uppercase tracking-tight">Cargar Clases (Pack)</span>
                                    <p className="text-[10px] font-bold text-primary-main/60 uppercase tracking-widest mt-0.5">Renovar saldo o paquete</p>
                                </div>
                            </button>
                            <button onClick={() => handleActionClick('schedule')} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 group-hover:scale-110 transition-transform"><Calendar size={18} className="text-text-main" /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-text-main uppercase tracking-tight">Ver Horarios</span>
                                    <p className="text-[10px] font-bold text-text-muted opacity-50 uppercase tracking-widest mt-0.5">Consultar agenda semanal</p>
                                </div>
                            </button>
                            <button onClick={() => handleActionClick('history')} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 group-hover:scale-110 transition-transform"><ClipboardList size={18} className="text-text-main" /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-text-main uppercase tracking-tight">Historial Asistencia</span>
                                    <p className="text-[10px] font-bold text-text-muted opacity-50 uppercase tracking-widest mt-0.5">Registro de clases dadas</p>
                                </div>
                            </button>
                            <button onClick={() => handleActionClick('notes')} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left group">
                                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 group-hover:scale-110 transition-transform"><FileText size={18} className="text-text-main" /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-text-main uppercase tracking-tight">Notas Privadas</span>
                                    <p className="text-[10px] font-bold text-text-muted opacity-50 uppercase tracking-widest mt-0.5">Anotaciones y recordatorios</p>
                                </div>
                            </button>
                            <div className="h-px bg-border-main/50 my-2 mx-6" />
                            <button onClick={() => handleActionClick('delete')} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl hover:bg-red-500/10 transition-all text-left group">
                                <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all"><Trash2 size={18} /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-black text-red-500 uppercase tracking-tight">Eliminar Alumno</span>
                                    <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mt-0.5">Acción irreversible</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
};

export default StudentTable;
