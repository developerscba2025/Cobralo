import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, User } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    phone: string;
    amount: number;
    service_name: string;
    sub_category?: string | null;
    billing_alias?: string | null;
}

interface PriceUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    currency: string;
    bizName: string;
    bizAlias: string;
    template: string;
}

const PriceUpdateModal: React.FC<PriceUpdateModalProps> = ({
    isOpen,
    onClose,
    students,
    currency,
    bizName,
    bizAlias,
    template
}) => {
    const generateWaLink = (student: Student) => {
        const serviceName = (student.service_name === 'General' && student.sub_category) ? student.sub_category : (student.service_name || '');
        const message = template
            .replace('{alumno}', student.name)
            .replace('{monto}', Number(student.amount).toLocaleString('es-AR'))
            .replace('{negocio}', bizName || 'Mi Negocio')
            .replace('{servicio}', serviceName)
            .replace('{alias}', student.billing_alias || bizAlias || 'mi-alias');

        return `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
                    >
                        <button onClick={onClose} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 dark:hover:text-white transition">
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">¡Precios Actualizados!</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Se actualizaron {students.length} alumnos. Podés avisarles por WhatsApp ahora:
                            </p>
                        </div>

                        <div className="space-y-3">
                            {students.map(student => (
                                <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:bg-white dark:hover:bg-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-600/10 flex items-center justify-center text-green-600">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                                            <p className="text-xs font-bold text-green-600">Nueva cuota: {currency}{Number(student.amount).toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                    {student.phone ? (
                                        <a
                                            href={generateWaLink(student)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition shadow-md shadow-green-100 dark:shadow-none"
                                        >
                                            <Send size={18} />
                                        </a>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Sin Teléfono</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                            Cerrar
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PriceUpdateModal;
