import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import type { ReceiptData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FileDown, Share2, Receipt as ReceiptIcon, Search, Calendar, User, DollarSign, Download, ExternalLink } from 'lucide-react';
import { showToast } from '../components/Toast';

const Receipts: React.FC = () => {
    const { isPro } = useAuth();
    const [receipts, setReceipts] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const data = await api.getReceipts();
                setReceipts(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching receipts:', error);
                setError('No se pudieron cargar los recibos');
                showToast.error('No se pudieron cargar los recibos');
            } finally {
                setLoading(false);
            }
        };
        fetchReceipts();
    }, []);

    const handleDownload = async (id: number) => {
        if (!isPro) {
            showToast.error('La generación de PDF es una función PRO');
            return;
        }
        try {
            await api.downloadReceiptPDF(id);
            showToast.success('Recibo descargado correctamente');
        } catch (error) {
            showToast.error('Error al descargar el recibo');
        }
    };

    const handleWhatsApp = async (id: number) => {
        try {
            const res = await api.sendReceiptWhatsApp(id);
            if (res.whatsappUrl) {
                window.open(res.whatsappUrl, '_blank');
            } else {
                showToast.success('Mensaje generado');
            }
        } catch (error) {
            showToast.error('Error al enviar por WhatsApp');
        }
    };

    const filteredReceipts = receipts.filter(r => 
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <ReceiptIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{error}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                        Ocurrió un problema al obtener tus recibos. Por favor, intentá recargar la página.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                    >
                        Recargar Página
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-600/10 text-green-600 rounded-2xl flex items-center justify-center">
                                <ReceiptIcon size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Recibos</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">Historial de pagos y comprobantes emitidos</p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por alumno o N°..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-green-600 transition-all outline-none dark:text-white font-medium"
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    {filteredReceipts.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <ReceiptIcon size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter">No hay recibos registrados</h3>
                            <p className="text-slate-400 text-sm font-medium">Los recibos se generan automáticamente cuando marcas un pago como cobrado.</p>
                        </div>
                    ) : (
                        filteredReceipts.map((r, index) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-white/5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">MES</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{r.month}</span>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                        <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{r.studentName}</h3>
                                        <span className="hidden md:block text-slate-300 px-1">•</span>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{r.receiptNumber}</span>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-green-600" />
                                            {new Date(r.paidAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign size={14} className="text-green-600" />
                                            ${r.amount.toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ReceiptIcon size={14} className="text-green-600" />
                                            {r.service}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleDownload(r.id)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all active:scale-90
                                            ${isPro 
                                                ? 'bg-slate-900 dark:bg-green-700 text-white hover:bg-slate-800 dark:hover:bg-green-600' 
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
                                    >
                                        <Download size={18} />
                                        <span className="hidden md:inline">PDF</span>
                                        {!isPro && <span className="text-[8px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-full ml-1">PRO</span>}
                                    </button>
                                    <button
                                        onClick={() => handleWhatsApp(r.id)}
                                        className="flex items-center gap-2 px-5 py-3 bg-green-50 dark:bg-green-600/10 text-green-700 dark:text-green-400 rounded-2xl font-bold hover:bg-green-100 dark:hover:bg-green-600/20 transition-all active:scale-90"
                                    >
                                        <Share2 size={18} />
                                        <span className="hidden md:inline">Enviar</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {!isPro && receipts.length > 0 && (
                    <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center">
                                <ReceiptIcon size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 dark:text-amber-400">Descarga de PDFs ilimitada</h4>
                                <p className="text-sm text-amber-800/60 dark:text-amber-400/60">Pasate a PRO para descargar y compartir comprobantes profesionales.</p>
                            </div>
                        </div>
                        <a href="/settings?tab=subscription" className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20">MEJORAR PLAN ✨</a>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Receipts;
