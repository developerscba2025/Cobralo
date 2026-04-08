import React from 'react';
import type { Student } from '../../services/api';
import StudentFormModal from './StudentFormModal';
import ExtraPaymentModal from './ExtraPaymentModal';
import QRPayment from '../QRPayment';
import ScheduleModal from '../ScheduleModal';
import AttendanceModal from '../AttendanceModal';
import ConfirmModal from '../ConfirmModal';
import StudentNotes from '../StudentNotes';
import WhatsAppPreviewModal from '../WhatsAppPreviewModal';

interface StudentModalsContainerProps {
    modals: {
        create: boolean;
        edit: { isOpen: boolean; student: Student | null };
        qr: { isOpen: boolean; student: Student | null };
        schedule: { isOpen: boolean; student: Student | null };
        history: { isOpen: boolean; student: Student | null };
        notes: { isOpen: boolean; student: Student | null };
        delete: { isOpen: boolean; student: Student | null };
        whatsapp: boolean;
        adjustment: boolean;
        upsell: boolean;
    };
    onClose: (type: string) => void;
    onAction: () => void;
    selectedStudents: Student[];
    user: any;
    userServices: any[];
}

const StudentModalsContainer: React.FC<StudentModalsContainerProps> = ({
    modals,
    onClose,
    onAction,
    selectedStudents,
    user,
    userServices
}) => {
    return (
        <>
            {/* Create Student */}
            <StudentFormModal 
                isOpen={modals.create}
                onClose={() => onClose('create')}
                onSuccess={() => { onAction(); onClose('create'); }}
                user={user}
                userServices={userServices}
            />

            {/* Edit Student */}
            <StudentFormModal 
                isOpen={modals.edit.isOpen}
                onClose={() => onClose('edit')}
                onSuccess={() => { onAction(); onClose('edit'); }}
                student={modals.edit.student}
                user={user}
                userServices={userServices}
            />

            {/* QR Payment */}
            {modals.qr.student && (
                <QRPayment
                    isOpen={modals.qr.isOpen}
                    onClose={() => onClose('qr')}
                    studentName={modals.qr.student.name}
                    amount={Number(modals.qr.student.amount)}
                    alias={modals.qr.student.billing_alias || user?.bizAlias || 'Sin alias'}
                    paymentMethod={modals.qr.student.payment_method || 'Efectivo'}
                />
            )}

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
                    student={modals.history.student}
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
                onConfirm={onAction}
                onCancel={() => onClose('delete')}
                variant="danger"
            />

            {/* WhatsApp Mass Message */}
            <WhatsAppPreviewModal 
                isOpen={modals.whatsapp}
                onClose={() => onClose('whatsapp')}
                students={selectedStudents}
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

            {/* TODO: Implement Billing Adjustment Modal for multiple selection if needed */}
        </>
    );
};

export default StudentModalsContainer;
