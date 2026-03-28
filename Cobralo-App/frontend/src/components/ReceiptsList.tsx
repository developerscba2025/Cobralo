import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProFeature } from './ProGuard';
import { showToast } from './Toast';
import { FileText, MessageCircle, Eye, Loader2 } from 'lucide-react';

interface Receipt {
    id: number;
    receiptNumber: string;
    studentName: string;
    studentPhone?: string;
    amount: number;
    paidAt: string;
    month: number;
    year: number;
    service?: string;
}

export const ReceiptsList: React.FC = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const data = await api.getReceipts();
            setReceipts(data);
        } catch (err) {
            setError('Error al cargar los recibos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async (receiptId: number) => {
        setActionLoading(receiptId);
        try {
            await api.downloadReceiptPDF(receiptId);
            showToast.success('¡Recibo descargado!');
        } catch (err: any) {
            console.error(err);
            showToast.error(err.message || 'Error al generar PDF');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendWhatsApp = async (receiptId: number) => {
        setActionLoading(receiptId);
        try {
            await api.sendReceiptWhatsApp(receiptId);
            showToast.success('Recibo enviado por WhatsApp');
        } catch (err: any) {
            console.error(err);
            showToast.error('Error al enviar WhatsApp');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary-main" size={40} />
        </div>
    );

    if (error) return (
        <div className="max-w-2xl mx-auto mt-12 p-8 card-premium border-red-100 dark:border-red-900/20 text-center">
            <p className="text-red-500 font-bold">{error}</p>
            <button 
                onClick={fetchReceipts}
                className="mt-4 btn btn-ghost text-sm"
            >
                Reintentar
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-100 dark:border-border-emerald">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-emerald-500/50 bg-clip-text text-transparent">
                        Recibos
                    </h1>
                    <p className="text-zinc-400 dark:text-emerald-500/40 text-sm font-accent">
                        Historial de pagos y comprobantes generados
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="label-premium">Total: {receipts.length} recibos</span>
                </div>
            </div>

            {receipts.length === 0 ? (
                <div className="card-premium p-16 text-center border-dashed">
                    <div className="w-16 h-16 bg-zinc-50 dark:bg-bg-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100 dark:border-border-emerald">
                        <FileText className="text-zinc-300 dark:text-emerald-500/20" size={32} />
                    </div>
                    <p className="text-zinc-400 dark:text-emerald-500/30 font-accent">No hay recibos registrados aún</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {receipts.map((receipt) => (
                        <div key={receipt.id} className="card-premium p-6 flex flex-col hover:border-primary-main/30 transition-all hover:translate-y-[-4px] group">
                            <div className="flex items-start justify-between mb-4 pb-4 border-b border-zinc-50 dark:border-border-emerald/30">
                                <div>
                                    <h3 className="text-[10px] font-black text-zinc-400 dark:text-emerald-500/40 uppercase tracking-widest mb-1">
                                        Nº {receipt.receiptNumber}
                                    </h3>
                                    <p className="text-sm font-bold text-zinc-500">
                                        {new Date(receipt.paidAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <span className="text-2xl font-black text-primary-main">
                                    ${receipt.amount.toLocaleString('es-AR')}
                                </span>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] label-premium opacity-40">Alumno</span>
                                    <span className="text-sm font-bold text-zinc-700 dark:text-emerald-50">{receipt.studentName}</span>
                                </div>
                                {receipt.studentPhone && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] label-premium opacity-40">Contacto</span>
                                        <span className="text-xs text-zinc-500 font-mono">{receipt.studentPhone}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] label-premium opacity-40">Concepto</span>
                                    <span className="text-xs text-zinc-500 italic">
                                        {receipt.service || 'Servicio General'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-auto">
                                <ProFeature featureName="generación de PDF">
                                    <button
                                        className="btn-ghost py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-bg-dark transition-all active:scale-95 border border-zinc-100 dark:border-border-emerald"
                                        onClick={() => handleGeneratePDF(receipt.id)}
                                        disabled={actionLoading === receipt.id}
                                    >
                                        {actionLoading === receipt.id ? (
                                            <Loader2 className="animate-spin" size={12} />
                                        ) : (
                                            <>
                                                <FileText size={14} className="text-primary-main" />
                                                PDF
                                            </>
                                        )}
                                    </button>
                                </ProFeature>

                                <ProFeature featureName="envío por WhatsApp">
                                    <button
                                        className="btn-ghost py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-600 hover:border-green-200 dark:hover:border-green-900/40 transition-all active:scale-95 border border-zinc-100 dark:border-border-emerald"
                                        onClick={() => handleSendWhatsApp(receipt.id)}
                                        disabled={actionLoading === receipt.id}
                                    >
                                        {actionLoading === receipt.id ? (
                                            <Loader2 className="animate-spin" size={12} />
                                        ) : (
                                            <>
                                                <MessageCircle size={14} className="text-green-500" />
                                                WSP
                                            </>
                                        )}
                                    </button>
                                </ProFeature>

                                <button className="btn-ghost py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary-main/5 hover:text-primary-main hover:border-primary-main/20 transition-all active:scale-95 border border-zinc-100 dark:border-border-emerald">
                                    <Eye size={14} />
                                    Ver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

