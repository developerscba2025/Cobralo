import React, { useState } from 'react';
import { api, type Student } from '../../services/api';
import StudentFormModal from './StudentFormModal';
import ExtraPaymentModal from './ExtraPaymentModal';
import ScheduleModal from '../ScheduleModal';
import AttendanceModal from '../AttendanceModal';
import ConfirmModal from '../ConfirmModal';
import StudentNotes from '../StudentNotes';
import WhatsAppPreviewModal from '../WhatsAppPreviewModal';
import RenewPackModal from './RenewPackModal';
import { showToast } from '../Toast';

interface StudentModalsContainerProps {
    modals: {
        create: boolean;
        edit: { isOpen: boolean; student: Student | null };
        schedule: { isOpen: boolean; student: Student | null };
        history: { isOpen: boolean; student: Student | null };
        notes: { isOpen: boolean; student: Student | null };
        delete: { isOpen: boolean; student: Student | null };
        renew: { isOpen: boolean; student: Student | null };
        whatsapp: { isOpen: boolean; student: Student | null };
        adjustment: boolean;
        upsell: boolean;
    };
    onClose: (type: string) => void;
    onAction: () => void;
    selectedStudents: Student[];
    allStudents?: Student[];
    user: any;
    userServices: any[];
    refreshServices: () => Promise<void>;
}
const StudentModalsContainer: React.FC<StudentModalsContainerProps> = ({
    modals,
    onClose,
    onAction,
    selectedStudents,
    allStudents = [],
    user,
    userServices,
    refreshServices
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper to get fresh student data from the main list
    const getFreshStudent = (s: Student | null) => {
        if (!s) return null;
        return allStudents.find(item => item.id === s.id) || s;
    };

    return (
        <>
            {/* Create Student */}
            <StudentFormModal 
                isOpen={modals.create}
                onClose={() => onClose('create')}
                onSuccess={() => { onAction(); onClose('create'); }}
                user={user}
                userServices={userServices}
                refreshServices={refreshServices}
            />

            {/* Edit Student */}
            <StudentFormModal 
                isOpen={modals.edit.isOpen}
                onClose={() => onClose('edit')}
                onSuccess={() => { onAction(); onClose('edit'); }}
                student={getFreshStudent(modals.edit.student)}
                user={user}
                userServices={userServices}
                refreshServices={refreshServices}
            />


            {/* Schedule Modal */}
            <ScheduleModal 
                isOpen={modals.schedule.isOpen}
                onClose={() => onClose('schedule')}
                studentId={modals.schedule.student?.id || 0}
                studentName={modals.schedule.student?.name || ''}
            />

            {/* Attendance Modal */}
            {modals.history.isOpen && modals.history.student && (
                <AttendanceModal 
                    onClose={() => onClose('history')}
                    student={getFreshStudent(modals.history.student)!}
                    onUpdate={onAction}
                />
            )}

            {/* Notes Modal */}
            <StudentNotes 
                isOpen={modals.notes.isOpen}
                onClose={() => onClose('notes')}
                studentId={modals.notes.student?.id || 0}
                studentName={modals.notes.student?.name || ''}
            />

            {/* Delete Confirm */}
            <ConfirmModal 
                isOpen={modals.delete.isOpen}
                title="Eliminar Alumno"
                message={`¿Estás seguro de eliminar a ${modals.delete.student?.name}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                isLoading={isDeleting}
                onConfirm={async () => {
                    if (modals.delete.student) {
                        setIsDeleting(true);
                        try {
                            await api.deleteStudent(modals.delete.student.id);
                            showToast.success('Alumno eliminado correctamente');
                            onAction();
                            onClose('delete');
                        } catch (error) {
                            showToast.error('Error al eliminar alumno');
                        } finally {
                            setIsDeleting(false);
                        }
                    }
                }}
                onCancel={() => onClose('delete')}
                variant="danger"
            />

            {/* WhatsApp Mass Message */}
            <WhatsAppPreviewModal 
                isOpen={modals.whatsapp.isOpen}
                onClose={() => onClose('whatsapp')}
                students={modals.whatsapp.student ? [getFreshStudent(modals.whatsapp.student)!] : selectedStudents}
                user={user}
                isPro={user?.plan === 'PRO'}
            />

            {/* Extra Payment (Adjustment in the container type) */}
            <ExtraPaymentModal 
                isOpen={modals.adjustment}
                onClose={() => onClose('adjustment')}
                onSuccess={onAction}
                student={selectedStudents.length === 1 ? selectedStudents[0] : null}
                currency={user?.currency || '$'}
            />

            {/* Renew Pack Modal */}
            <RenewPackModal 
                isOpen={modals.renew.isOpen}
                onClose={() => onClose('renew')}
                student={getFreshStudent(modals.renew.student)}
                onSuccess={onAction}
            />

            {/* TODO: Implement Billing Adjustment Modal for multiple selection if needed */}
        </>
    );
};

export default StudentModalsContainer;
