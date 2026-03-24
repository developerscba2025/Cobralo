import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProFeature } from './ProGuard';
import styles from './Receipts.module.css';
import { showToast } from './Toast';

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
    const { isPro } = useAuth();
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
        if (!isPro) return;
        
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
        if (!isPro) return;

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

    if (loading) return <div className={styles.container}>Cargando...</div>;
    if (error) return <div className={styles.container}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Recibos</h1>
                {!isPro && (
                    <div className={styles.proInfo}>
                        ℹ️ Genera y envía recibos en PDF con{' '}
                        <strong>Plan Pro</strong>
                    </div>
                )}
            </div>

            {receipts.length === 0 ? (
                <div className={styles.empty}>
                    <p>No hay recibos registrados</p>
                </div>
            ) : (
                <div className={styles.receiptsGrid}>
                    {receipts.map((receipt) => (
                        <div key={receipt.id} className={styles.receiptCard}>
                            <div className={styles.receiptHeader}>
                                <h3>{receipt.receiptNumber}</h3>
                                <span className={styles.amount}>
                                    ${receipt.amount.toFixed(2)}
                                </span>
                            </div>

                            <div className={styles.receiptBody}>
                                <p>
                                    <strong>Alumno:</strong> {receipt.studentName}
                                </p>
                                {receipt.studentPhone && (
                                    <p>
                                        <strong>Tel:</strong> {receipt.studentPhone}
                                    </p>
                                )}
                                <p>
                                    <strong>Servicio:</strong>{' '}
                                    {receipt.service || 'Sin especificar'}
                                </p>
                                <p>
                                    <strong>Fecha:</strong>{' '}
                                    {new Date(receipt.paidAt).toLocaleDateString('es-AR')}
                                </p>
                            </div>

                            <div className={styles.receiptActions}>
                                {/* Botón Generar PDF - Feature Pro */}
                                <ProFeature featureName="generación de PDF">
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handleGeneratePDF(receipt.id)}
                                        disabled={actionLoading === receipt.id}
                                    >
                                        {actionLoading === receipt.id ? '⌛...' : '📄 PDF'}
                                    </button>
                                </ProFeature>

                                {/* Botón Enviar WhatsApp - Feature Pro */}
                                <ProFeature featureName="envío por WhatsApp">
                                    <button
                                        className={`${styles.actionButton} ${styles.whatsapp}`}
                                        onClick={() => handleSendWhatsApp(receipt.id)}
                                        disabled={actionLoading === receipt.id}
                                    >
                                        {actionLoading === receipt.id ? '⌛...' : '💬 WhatsApp'}
                                    </button>
                                </ProFeature>

                                {/* Botón Ver - Siempre disponible */}
                                <button className={`${styles.actionButton} ${styles.secondary}`}>
                                    👁️ Ver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
