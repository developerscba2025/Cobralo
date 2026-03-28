import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const SubscriptionCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const status = searchParams.get('status') || searchParams.get('collection_status');

    useEffect(() => {
        // Refresh user data from API to pick up isPro = true if payment was approved
        if (status === 'approved' || status === 'success') {
            api.getProfile()
                .then(updatedUser => updateUser(updatedUser))
                .catch(console.error);
        }

        const timer = setTimeout(() => {
            navigate('/app/settings');
        }, 5000);

        return () => clearTimeout(timer);
    }, [status]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white p-4">
            <div className="max-w-md w-full bg-bg-soft rounded-[48px] p-12 text-center shadow-xl border border-border-emerald animate-in fade-in zoom-in-95 duration-700">

                {(status === 'approved' || status === 'success') && (
                    <>
                        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">¡Pago Exitoso!</h1>
                        <p className="text-zinc-400 font-bold mb-8">
                            Tu pago se procesó correctamente. ¡Bienvenido a Cobralo PRO!
                        </p>
                    </>
                )}

                {(status === 'pending' || status === 'in_process') && (
                    <>
                        <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Clock size={48} />
                        </div>
                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Pago en Proceso</h1>
                        <p className="text-zinc-400 font-bold mb-8">
                            Estamos confirmando tu pago. Tu plan será activado en minutos.
                        </p>
                    </>
                )}

                {(status === 'rejected' || status === 'failure') && (
                    <>
                        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <XCircle size={48} />
                        </div>
                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Pago Rechazado</h1>
                        <p className="text-zinc-400 font-bold mb-8">
                            Hubo un problema al procesar tu pago. Por favor intentá nuevamente.
                        </p>
                    </>
                )}

                {!status && (
                    <>
                        <div className="w-24 h-24 bg-zinc-500/10 text-zinc-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Clock size={48} />
                        </div>
                        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Verificando pago...</h1>
                        <p className="text-zinc-400 font-bold mb-8">
                            Por favor aguardá un momento.
                        </p>
                    </>
                )}

                <button
                    onClick={() => navigate('/app/settings')}
                    className="w-full bg-primary-main text-white font-black py-4 rounded-[24px] shadow-lg shadow-primary-glow flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:bg-green-600 transition-all active:scale-95"
                >
                    <Zap size={18} /> Volver a mi panel
                </button>

                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-8">
                    Serás redirigido automáticamente en unos segundos...
                </p>
            </div>
        </div>
    );
};

export default SubscriptionCallback;
