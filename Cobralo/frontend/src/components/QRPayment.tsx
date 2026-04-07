import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { showToast } from './Toast';

interface QRPaymentProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    amount: number;
    alias: string;
    paymentMethod: string;
}

const QRPayment: React.FC<QRPaymentProps> = ({
    isOpen,
    onClose,
    studentName,
    amount,
    alias,
    paymentMethod
}) => {
    const [copied, setCopied] = useState(false);

    // QR content - alias for payment
    const qrContent = `${alias}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(alias);
        setCopied(true);
        showToast.success('Alias copiado');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const message = `💰 Datos para el pago:
Alumno: ${studentName}
Monto: $${amount.toLocaleString('es-AR')}
Alias ${paymentMethod}: ${alias}`;

        if (navigator.share) {
            navigator.share({
                title: 'Datos de pago',
                text: message
            });
        } else {
            const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(waUrl, '_blank');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 text-slate-300 hover:text-slate-600 dark:hover:text-white transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                QR de Pago
                            </h2>
                            <p className="text-slate-500 text-sm mb-6">
                                {studentName} - ${amount.toLocaleString('es-AR')}
                            </p>

                            {/* QR Code */}
                            <div className="bg-white p-6 rounded-2xl inline-block mb-6 shadow-inner">
                                <QRCodeSVG
                                    value={qrContent}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#1e293b"
                                />
                            </div>

                            {/* Alias */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-6">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                                    Alias {paymentMethod}
                                </p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white font-mono">
                                    {alias}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition"
                                >
                                    <Share2 size={18} />
                                    Compartir
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QRPayment;
