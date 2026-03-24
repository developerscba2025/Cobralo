import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ProLock.module.css';

interface ProLockProps {
    featureName: string;
    children?: React.ReactNode;
}

export const ProLock: React.FC<ProLockProps> = ({ featureName, children }) => {
    const { isPro } = useAuth();
    const [showModal, setShowModal] = useState(false);

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <>
            <div className={styles.lockContainer}>
                <div className={styles.lockIcon}>🔒</div>
                <p className={styles.lockText}>Pasate a Pro</p>
                <button
                    className={styles.upgradeButton}
                    onClick={() => setShowModal(true)}
                >
                    Desbloquear {featureName}
                </button>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.closeButton}
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </button>
                        <h2>🚀 Acceso exclusivo Pro</h2>
                        <p>Desbloquea {featureName} y muchas más funcionalidades</p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span>✓</span> Acceso ilimitado
                            </div>
                            <div className={styles.feature}>
                                <span>✓</span> Soporte prioritario
                            </div>
                            <div className={styles.feature}>
                                <span>✓</span> Reportes avanzados
                            </div>
                        </div>
                        <a href="/settings#upgrade" className={styles.ctaButton}>
                            Pasate a Pro por $999/mes
                        </a>
                    </div>
                </div>
            )}
        </>
    );
};
