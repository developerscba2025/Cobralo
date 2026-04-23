import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg-app flex flex-col items-center justify-center text-text-main px-4">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-main to-secondary-main mb-4">404</h1>
            <p className="text-xl text-gray-400 mb-8 text-center max-w-md">
                La página que estás buscando no existe o ha sido movida.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="bg-primary-main/10 text-primary-main hover:bg-primary-main/20 px-6 py-3 rounded-xl transition-all border border-primary-main/20 font-medium"
            >
                Volver atrás
            </button>
        </div>
    );
};

export default NotFound;
