import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Mode = 'confirm' | 'cancel';
type Status = 'loading' | 'success' | 'already' | 'error';

interface ResultData {
    studentName?: string;
    teacherName?: string;
    time?: string;
}

const AttendanceConfirmPage: React.FC<{ mode: Mode }> = ({ mode }) => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<Status>('loading');
    const [data, setData] = useState<ResultData>({});

    useEffect(() => {
        if (!token) { setStatus('error'); return; }
        const action = mode === 'confirm' ? 'confirm' : 'cancel';
        fetch(`/api/notifications/${action}/${token}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                if (json.alreadyConfirmed) setStatus('already');
                else if (json.error) setStatus('error');
                else setStatus('success');
            })
            .catch(() => setStatus('error'));
    }, [token, mode]);

    const isConfirm = mode === 'confirm';

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-sm w-full text-center space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="text-3xl font-black text-emerald-400 tracking-tight">Cobralo</div>
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-3xl p-10 shadow-2xl backdrop-blur-sm space-y-6">
                    {status === 'loading' && (
                        <>
                            <div className="w-16 h-16 rounded-full border-4 border-zinc-600 border-t-emerald-400 animate-spin mx-auto" />
                            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Procesando...</p>
                        </>
                    )}

                    {status === 'success' && isConfirm && (
                        <>
                            <div className="text-6xl">✅</div>
                            <h1 className="text-2xl font-black text-white">¡Confirmado!</h1>
                            <p className="text-zinc-400">
                                <span className="text-white font-bold">{data.studentName}</span>, tu asistencia{data.time ? ` a la clase de las ${data.time}hs` : ''} fue registrada exitosamente.
                            </p>
                            {data.teacherName && (
                                <p className="text-xs text-zinc-500 uppercase tracking-widest">Academia: {data.teacherName}</p>
                            )}
                        </>
                    )}

                    {status === 'success' && !isConfirm && (
                        <>
                            <div className="text-6xl">👋</div>
                            <h1 className="text-2xl font-black text-white">Entendido</h1>
                            <p className="text-zinc-400">
                                <span className="text-white font-bold">{data.studentName}</span>, avisamos que no vas a poder{data.time ? ` a la clase de las ${data.time}hs` : ''}. ¡Hasta la próxima!
                            </p>
                        </>
                    )}

                    {status === 'already' && (
                        <>
                            <div className="text-6xl">👍</div>
                            <h1 className="text-2xl font-black text-white">Ya estás confirmado</h1>
                            <p className="text-zinc-400">
                                {data.studentName}, tu asistencia{data.time ? ` a las ${data.time}hs` : ''} ya estaba registrada.
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="text-6xl">⚠️</div>
                            <h1 className="text-2xl font-black text-white">Link inválido</h1>
                            <p className="text-zinc-400">Este enlace expiró o no es válido. Comunicate con tu academia.</p>
                        </>
                    )}
                </div>

                <p className="text-zinc-600 text-xs">Powered by <span className="text-emerald-500 font-bold">Cobralo</span></p>
            </div>
        </div>
    );
};

export default AttendanceConfirmPage;
