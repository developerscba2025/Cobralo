import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    actionLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction, actionLink }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-bg-app rounded-[32px] border border-dashed border-border-emerald/40 my-4 shadow-sm w-full mx-auto max-w-2xl">
            <div className="w-20 h-20 rounded-[24px] bg-primary-main/10 flex items-center justify-center text-primary-main/60 mb-6 shadow-inner">
                <Icon size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-text-main mb-2 tracking-tight">{title}</h3>
            <p className="text-text-muted text-sm max-w-sm mb-8 leading-relaxed">{description}</p>
            
            {(actionLabel && onAction) && (
                <button 
                    onClick={onAction}
                    className="btn btn-primary"
                >
                    {actionLabel}
                </button>
            )}
            
            {(actionLabel && actionLink) && (
                <Link 
                    to={actionLink}
                    className="btn btn-primary"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;
