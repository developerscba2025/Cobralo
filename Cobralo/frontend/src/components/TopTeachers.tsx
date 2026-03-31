import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Star, Award, MessageSquare, ChevronRight, Loader2 } from 'lucide-react';

interface Teacher {
    id: number;
    name: string;
    bizName: string;
    category: string;
    avgRating: number;
    reviewCount: number;
    featuredReview: {
        comment: string;
        author: string;
        date: string;
    } | null;
}

export const TopTeachers: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await api.getTopTeachers();
                setTeachers(data);
            } catch (error) {
                console.error('Error fetching top teachers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-primary-main" />
        </div>
    );
    
    if (teachers.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-100 dark:border-border-emerald">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <Award className="text-amber-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-emerald-500/50 bg-clip-text text-transparent">
                            Profesores Destacados
                        </h2>
                        <p className="text-zinc-400 dark:text-emerald-500/40 text-sm font-accent">
                            Los profesionales mejor valorados de nuestra comunidad
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((teacher) => (
                    <div key={teacher.id} className="card-premium p-6 hover:translate-y-[-4px] transition-all flex flex-col group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary-main/10 rounded-2xl flex items-center justify-center text-xl font-black text-primary-main border border-primary-main/20 group-hover:scale-110 transition-transform">
                                {teacher.bizName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-sm font-black text-zinc-800 dark:text-emerald-50">{teacher.bizName}</h3>
                                <p className="text-[10px] label-premium opacity-50">
                                    {teacher.category || 'Profesional Cobralo'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                <Star className="fill-amber-400 text-amber-400" size={14} />
                                <span className="text-xs font-black text-amber-700 dark:text-amber-400">{teacher.avgRating}</span>
                            </div>
                        </div>

                        {teacher.featuredReview ? (
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-bg-dark/50 border border-zinc-100 dark:border-border-emerald mb-6 relative">
                                <MessageSquare className="text-zinc-300 dark:text-emerald-900 absolute -top-2 -right-2" size={20} />
                                <p className="text-xs italic text-zinc-500 dark:text-emerald-100/60 leading-relaxed">
                                    "{teacher.featuredReview.comment}"
                                </p>
                                <span className="block text-[10px] font-bold mt-3 text-zinc-400 dark:text-emerald-500/40 mb-[-4px]">
                                    — {teacher.featuredReview.author}
                                </span>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-bg-dark/50 border border-dashed border-zinc-200 dark:border-border-emerald/50 mb-6 text-center">
                                <p className="text-xs text-zinc-400 dark:text-emerald-500/30 italic">
                                    ¡Excelente profesional! Súper recomendado.
                                </p>
                            </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-zinc-50 dark:border-border-emerald/30 flex items-center justify-between">
                            <span className="text-[10px] label-premium opacity-40">
                                {teacher.reviewCount} testimonios
                            </span>
                            <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary-main hover:translate-x-1 transition-transform">
                                Ver perfil <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

