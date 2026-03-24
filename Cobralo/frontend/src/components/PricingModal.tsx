import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './PricingModal.module.css';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { isPro, user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'PRO_SEMESTRAL'>('PRO_MONTHLY');
    const [loading, setLoading] = useState(false);

    if (!isOpen || isPro) return null;

    const handleCheckout = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/subscription/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ planId: selectedPlan })
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                alert('Error al iniciar el pago. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar tu solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>✕</button>

                <div className={styles.header}>
                    <h1>Lanzamiento Cobralo <span className={styles.launchDiscount}>50% OFF</span></h1>
                    <p>¡Aprovecha nuestra oferta de lanzamiento y lleva tu academia al siguiente nivel!</p>
                </div>

                <div className={styles.pricingContainer}>
                    {/* Plan FREE */}
                    <div className={styles.planCard}>
                        <h2>FREE</h2>
                        <p className={styles.price}>Siempre $0</p>
                        <ul className={styles.features}>
                            <li>✓ Hasta 5 estudiantes</li>
                            <li>✓ Control de asistencia</li>
                            <li>✓ Registro de pagos</li>
                            <li>✗ Funciones Premium</li>
                        </ul>
                        <button className={styles.buttonSecondary} disabled>
                            Plan actual {user?.plan === 'FREE' ? '✓' : ''}
                        </button>
                    </div>

                    {/* Plan PRO */}
                    <div className={`${styles.planCard} ${styles.featured}`}>
                        <div className={styles.badge}>Plan Pro - Alumnos Ilimitados</div>
                        <h2>PRO</h2>

                        <div className={styles.planSelector}>
                            <label className={selectedPlan === 'PRO_MONTHLY' ? styles.selected : ''}>
                                <input
                                    type="radio"
                                    value="PRO_MONTHLY"
                                    checked={selectedPlan === 'PRO_MONTHLY'}
                                    onChange={(e) => setSelectedPlan(e.target.value as 'PRO_MONTHLY')}
                                />
                                <span className={styles.price}>
                                    <span className={styles.originalPrice}>$999</span>
                                    $499 <small>/mes</small>
                                </span>
                            </label>
                            <label className={selectedPlan === 'PRO_SEMESTRAL' ? styles.selected : ''}>
                                <input
                                    type="radio"
                                    value="PRO_SEMESTRAL"
                                    checked={selectedPlan === 'PRO_SEMESTRAL'}
                                    onChange={(e) => setSelectedPlan(e.target.value as 'PRO_SEMESTRAL')}
                                />
                                <span className={styles.price}>
                                    <span className={styles.originalPrice}>$4999</span>
                                    $2499 <small>/semestre</small>
                                </span>
                                <span className={styles.savings}>Ahorro Extra</span>
                            </label>
                        </div>

                        <ul className={styles.features}>
                            <li>✓ Estudiantes ilimitados</li>
                            <li>✓ Recordatorios WhatsApp</li>
                            <li>✓ Recibos PDF Personalizados</li>
                            <li>✓ Dashboards Avanzados</li>
                            <li>✓ Google Calendar Sync</li>
                            <li>✓ Exportación a Excel</li>
                        </ul>

                        <button
                            className={styles.buttonPrimary}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : '💳 Suscribirme con Mercado Pago'}
                        </button>
                    </div>
                </div>

                <div className={styles.transferSection}>
                    <h3>🏦 Transferencia Bancaria (PRO Semestral)</h3>
                    <p>Si prefieres pagar vía transferencia (pago único por 6 meses), utiliza los siguientes datos y envía el comprobante por WhatsApp:</p>
                    <div className={styles.transferDetails}>
                        <p><strong>Alias:</strong> cobralo.app.mp</p>
                        <p><strong>CBU:</strong> 0000003100012345678901</p>
                        <p><strong>Monto:</strong> $2.499 (50% OFF Lanzamiento)</p>
                        <p><strong>Titular:</strong> Cobralo Soluciones</p>
                    </div>
                </div>

                <p className={styles.disclaimer}>
                    Acceso inmediato al confirmar el pago. Los precios incluyen IVA.
                </p>
            </div>
        </div>
    );
};
