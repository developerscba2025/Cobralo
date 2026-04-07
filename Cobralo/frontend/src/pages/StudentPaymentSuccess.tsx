import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const StudentPaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        // Here you could potentially trigger an analytics event or local storage clean up
    }, []);

    return (
        <div className="min-h-screen bg-bg-app flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="bg-surface border border-border-main p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center"
            >
                <div className="w-20 h-20 bg-primary-main/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-primary-main" size={40} />
                </div>
                
                <h1 className="text-2xl font-black text-text-main mb-2">¡Pago Exitoso!</h1>
                <p className="text-text-muted mb-6">
                    Tu pago ha sido procesado de forma segura a través de Mercado Pago.
                    El profesor ya ha sido notificado y el comprobante ha impactado en su sistema.
                </p>

                {paymentId && (
                    <div className="bg-bg-soft rounded-xl p-4 mb-8">
                        <p className="text-sm font-medium text-text-muted">ID de Comprobante</p>
                        <p className="font-mono font-bold text-text-main mt-1">#{paymentId}</p>
                    </div>
                )}

                <p className="text-sm text-text-muted mb-8 italic">
                    Ya puedes cerrar esta ventana con seguridad o volver atrás.
                </p>

                <Link to="/" className="inline-flex items-center justify-center w-full gap-2 px-6 py-3.5 bg-primary-main text-white rounded-xl font-bold hover:bg-green-600 transition-colors">
                    <ArrowLeft size={18} />
                    Ir al Inicio de la App
                </Link>
            </motion.div>
        </div>
    );
};

export default StudentPaymentSuccess;
