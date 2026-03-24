import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './PricingModal.module.css';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const { isPro, user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'PRO_MONTHLY' | 'PRO_ANNUAL'>('PRO_MONTHLY');
    const [loading, setLoading] = useState(false);

    if (!isOpen || isPro) return null;

    const handleCheckout = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/subscription/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ planId: selectedPlan })
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                // Redirigir al link de pago
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
                    <h1>Planes de Cobralo</h1>
                    <p>Elige el plan que mejor se adapta a tu academia</p>
                </div>

                <div className={styles.pricingContainer}>
                    {/* Plan FREE */}
                    <div className={styles.planCard}>
                        <h2>FREE</h2>
                        <p className={styles.price}>Gratis</p>
                        <ul className={styles.features}>
                            <li>✓ Hasta 5 estudiantes</li>
                            <li>✓ Control de asistencia</li>
                            <li>✓ Registro de pagos</li>
                            <li>✗ Reportes avanzados</li>
                            <li>✗ Recibos PDF</li>
                            <li>✗ Envío por WhatsApp</li>
                        </ul>
                        <button className={styles.buttonSecondary} disabled>
                            Plan actual {user?.plan === 'FREE' ? '✓' : ''}
                        </button>
                    </div>

                    {/* Plan PRO */}
                    <div className={`${styles.planCard} ${styles.featured}`}>
                        <div className={styles.badge}>Lo más popular</div>
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
                                    $999 <small>/mes</small>
                                </span>
                            </label>
                            <label className={selectedPlan === 'PRO_ANNUAL' ? styles.selected : ''}>
                                <input
                                    type="radio"
                                    value="PRO_ANNUAL"
                                    checked={selectedPlan === 'PRO_ANNUAL'}
                                    onChange={(e) => setSelectedPlan(e.target.value as 'PRO_ANNUAL')}
                                />
                                <span className={styles.price}>
                                    $9.999 <small>/año</small>
                                </span>
                                <span className={styles.savings}>Ahorra 17%</span>
                            </label>
                        </div>

                        <ul className={styles.features}>
                            <li>✓ Estudiantes ilimitados</li>
                            <li>✓ Control de asistencia avanzado</li>
                            <li>✓ Registro de pagos completo</li>
                            <li>✓ Reportes de ganancias por alumno</li>
                            <li>✓ Generación de recibos PDF</li>
                            <li>✓ Envío de recibos por WhatsApp</li>
                            <li>✓ Soporte prioritario</li>
                        </ul>

                        <button
                            className={styles.buttonPrimary}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : '💳 Pasar a Pro'}
                        </button>
                    </div>
                </div>

                <p className={styles.disclaimer}>
                    Cancela tu suscripción en cualquier momento. Sin compromisos a largo plazo.
                </p>
            </div>
        </div>
    );
};
