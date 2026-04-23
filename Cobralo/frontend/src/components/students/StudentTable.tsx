import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageCircle, MoreHorizontal, User, Calendar, 
    FileText, ClipboardList, Trash2, Edit2, PlusCircle, X,
    CheckCircle2, Check, Clock, Phone
} from 'lucide-react';
import type { Student } from '../../services/api';
import Tooltip from '../ui/Tooltip';

interface StudentRowProps {
    student: Student;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    onTogglePayment: (student: Student) => void;
    onOpenModals: (type: string, student: Student) => void;
    onOpenActionMenu: (student: Student) => void;
    currency: string;
}

const AVATAR_PALETTES = [
    'bg-violet-500', 'bg-blue-500', 'bg-sky-500', 'bg-teal-500',
    'bg-emerald-600', 'bg-pink-500', 'bg-orange-500', 'bg-indigo-500'
];

const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

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
    const isPaid = student.status === 'paid';

    return (
        <tr 
            className={`group border-b border-border-main/40 transition-colors ${isSelected ? 'bg-primary-main/5 dark:bg-primary-main/10' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
        >
            {/* Checkbox */}
            <td className="py-4 pl-5 pr-3 w-10">
                <div 
                    onClick={() => onToggleSelect(student.id)}
                    className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-primary-main border-primary-main text-white' : 'bg-bg-app border-border-main text-transparent hover:border-text-muted/40'}`}
                >
                    <Check size={12} strokeWidth={4} />
                </div>
            </td>

            {/* Alumno */}
            <td className="py-4 px-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0 ${getAvatarColor(student.name)}`}>
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-text-main truncate leading-tight">{student.name}</p>
                        <p className="text-[10px] font-bold text-text-muted opacity-70 truncate mt-0.5">{student.service_name || 'Sin servicio'}</p>
                    </div>
                </div>
            </td>

            {/* Estado de Pago */}
            <td className="py-4 px-3 hidden sm:table-cell">
                <Tooltip content={isPaid ? 'Marcar como pendiente' : 'Marcar como pagado'}>
                    <button 
                        onClick={() => onTogglePayment(student)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            isPaid
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black hover:border-emerald-500' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                        }`}
                    >
                        {isPaid 
                            ? <><CheckCircle2 size={11} strokeWidth={3} /> Al día</>
                            : <><Clock size={11} strokeWidth={3} /> Pendiente</>
                        }
                    </button>
                </Tooltip>
            </td>

            {/* Monto */}
            <td className="py-4 px-3 hidden md:table-cell">
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-text-main tabular-nums tracking-tight">
                        {currency}{Number(student.amount).toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] font-bold text-text-muted opacity-60 uppercase tracking-widest">
                        {student.planType === 'PACK' ? `${student.credits || 0} cl` : `${student.classes_per_month || 0} cl/ms`}
                    </span>
                </div>
            </td>

            {/* Vencimiento */}
            <td className="py-4 px-3 hidden lg:table-cell">
                {(student.schedules?.length || 0) === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/15">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Flexible
                    </span>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-black text-text-main uppercase tracking-tight">
                            Día {student.due_day || '--'}
                        </span>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60">
                            Próx. Vencimiento
                        </span>
                    </div>
                )}
            </td>

            {/* Teléfono */}
            <td className="py-4 px-3 hidden lg:table-cell">
                {student.phone ? (
                    <a 
                        href={`https://wa.me/${student.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted hover:text-green-500 transition-colors"
                    >
                        <Phone size={12} className="shrink-0" />
                        {student.phone}
                    </a>
                ) : (
                    <span className="text-[11px] font-bold text-text-muted/40">—</span>
                )}
            </td>

            {/* Acciones */}
            <td className="py-4 px-3 pr-5 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Tooltip position="top-end" content="Enviar mensaje WhatsApp">
                        <button 
                            onClick={() => onOpenModals('whatsapp', student)}
                            className="p-2 text-text-muted hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all"
                        >
                            <MessageCircle size={15} />
                        </button>
                    </Tooltip>
                    <Tooltip position="top-end" content="Ver opciones">
                        <button 
                            onClick={() => onOpenActionMenu(student)} 
                            className="p-2 text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                        >
                            <MoreHorizontal size={15} />
                        </button>
                    </Tooltip>
                </div>
            </td>
        </tr>
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
    
    const totalPages = Math.ceil(students.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage);
    
    const allSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedIds.includes(s.id));

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const [actionModal, setActionModal] = useState<{isOpen: boolean, student: Student | null}>({isOpen: false, student: null});
    const handleCloseActionMenu = () => setActionModal({isOpen: false, student: null});
    const handleActionClick = (type: string) => {
        if (actionModal.student) onOpenModals(type, actionModal.student);
        handleCloseActionMenu();
    };

    return (
        <>
            <div className="card-premium flex flex-col h-full min-h-0 relative">
                <div className="relative flex-1">
                    <div className="overflow-x-auto w-full hide-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-main/50 bg-black/[0.02] dark:bg-white/[0.02]">
                                    <th className="py-3.5 pl-5 pr-3 w-10">
                                        <div 
                                            onClick={onToggleAll}
                                            className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center cursor-pointer transition-all ${allSelected ? 'bg-primary-main border-primary-main text-white' : 'bg-surface border-border-main text-transparent hover:border-text-muted/40'}`}
                                        >
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Alumno</th>
                                    <th className="py-3.5 px-3 text-[9px] font-black text-text-muted uppercase tracking-widest hidden sm:table-cell">Estado</th>
                                    <th className="py-3.5 px-3 text-[9px] font-black text-text-muted uppercase tracking-widest hidden md:table-cell">Monto</th>
                                    <th className="py-3.5 px-3 text-[9px] font-black text-text-muted uppercase tracking-widest hidden lg:table-cell">Venc.</th>
                                    <th className="py-3.5 px-3 text-[9px] font-black text-text-muted uppercase tracking-widest hidden lg:table-cell">Teléfono</th>
                                    <th className="py-3.5 px-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-right pr-5">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <>
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
                                </>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {students.length > itemsPerPage && (
                    <div className="p-4 border-t border-border-main/40 flex items-center justify-between bg-bg-app">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, students.length)} de {students.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    currentPage === 1 
                                    ? 'opacity-30 cursor-not-allowed text-text-muted' 
                                    : 'bg-surface text-text-main border border-border-main hover:bg-primary-main/10 hover:text-primary-main hover:border-primary-main/20'
                                }`}
                            >
                                ← Anterior
                            </button>
                            <span className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black">
                                {currentPage} / {totalPages || 1}
                            </span>
                            <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    currentPage === totalPages || totalPages === 0
                                    ? 'opacity-30 cursor-not-allowed text-text-muted' 
                                    : 'bg-surface text-text-main border border-border-main hover:bg-primary-main/10 hover:text-primary-main hover:border-primary-main/20'
                                }`}
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {students.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-3xl bg-border-main/30 flex items-center justify-center mb-4">
                            <User size={28} className="text-text-muted/30" />
                        </div>
                        <h3 className="text-base font-black text-text-main tracking-tight uppercase">No se encontraron alumnos</h3>
                        <p className="text-sm font-bold text-text-muted mt-1 opacity-60">Probá con otros filtros o creá uno nuevo.</p>
                    </div>
                )}
            </div>

            {/* Action Menu Modal */}
            <AnimatePresence>
                {actionModal.isOpen && actionModal.student && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
                        <motion.div 
                            initial={{opacity: 0}} 
                            animate={{opacity: 1}} 
                            exit={{opacity: 0}} 
                            onClick={handleCloseActionMenu} 
                            className="absolute inset-0 modal-overlay"
                        />
                        <motion.div 
                            initial={{opacity: 0, y: 50, scale: 0.95}} 
                            animate={{opacity: 1, y: 0, scale: 1}} 
                            exit={{opacity: 0, y: 50, scale: 0.95}} 
                            className="relative bg-surface border border-border-main rounded-[40px] sm:rounded-[32px] shadow-2xl w-full sm:w-[420px] overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-border-main flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-text-main text-xl tracking-tight truncate pr-4 uppercase">{actionModal.student.name}</h3>
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted mt-1 opacity-50">Opciones del Alumno</p>
                                </div>
                                <button onClick={handleCloseActionMenu} className="p-2.5 rounded-2xl bg-black/5 dark:bg-surface hover:bg-black/10 dark:hover:bg-surface text-text-muted transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                                {[
                                    { type: 'edit', icon: <Edit2 size={18} className="text-text-main" />, label: 'Editar Datos', sub: 'Modificar información personal', bg: 'bg-bg-app' },
                                    { type: 'renew', icon: <PlusCircle size={18} className="text-black" />, label: 'Cargar Clases', sub: 'Renovar saldo o paquete', bg: 'bg-emerald-500', highlight: true },
                                    { type: 'schedule', icon: <Calendar size={18} className="text-text-main" />, label: 'Ver Horarios', sub: 'Consultar agenda semanal', bg: 'bg-bg-app' },
                                    { type: 'history', icon: <ClipboardList size={18} className="text-text-main" />, label: 'Historial Asistencia', sub: 'Registro de clases dadas', bg: 'bg-bg-app' },
                                    { type: 'notes', icon: <FileText size={18} className="text-text-main" />, label: 'Notas Privadas', sub: 'Anotaciones y recordatorios', bg: 'bg-bg-app' },
                                ].map(item => (
                                    <button key={item.type} onClick={() => handleActionClick(item.type)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left group ${item.highlight ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15' : 'hover:bg-bg-app'}`}>
                                        <div className={`p-2.5 rounded-xl ${item.bg} shrink-0`}>{item.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm font-black uppercase tracking-tight block ${item.highlight ? 'text-emerald-500' : 'text-text-main'}`}>{item.label}</span>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 opacity-50 ${item.highlight ? 'text-emerald-500' : 'text-text-muted'}`}>{item.sub}</p>
                                        </div>
                                    </button>
                                ))}
                                <div className="h-px bg-border-main/50 my-1 mx-2" />
                                <button onClick={() => handleActionClick('delete')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-500/10 transition-all text-left group">
                                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 shrink-0"><Trash2 size={18} /></div>
                                    <div className="flex-1">
                                        <span className="text-sm font-black text-red-500 uppercase tracking-tight block">Eliminar Alumno</span>
                                        <p className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest mt-0.5">Acción irreversible</p>
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
