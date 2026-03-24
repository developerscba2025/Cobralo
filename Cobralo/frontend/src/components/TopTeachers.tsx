import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Star, Award, MessageSquare, ChevronRight } from 'lucide-react';
import styles from './TopTeachers.module.css';

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

    if (loading || teachers.length === 0) return null;

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <Award className="text-amber-500" size={24} />
                    <div>
                        <h2>Profesores Destacados</h2>
                        <p>Los profesionales mejor valorados de nuestra comunidad</p>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {teachers.map((teacher) => (
                    <div key={teacher.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.avatar}>
                                {teacher.bizName.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.info}>
                                <h3>{teacher.bizName}</h3>
                                <p>{teacher.category || 'Profesional Cobralo'}</p>
                            </div>
                            <div className={styles.rating}>
                                <Star className="fill-amber-400 text-amber-400" size={16} />
                                <span>{teacher.avgRating}</span>
                            </div>
                        </div>

                        {teacher.featuredReview ? (
                            <div className={styles.review}>
                                <MessageSquare className="text-slate-300 shrink-0" size={14} />
                                <p>"{teacher.featuredReview.comment}"</p>
                                <span className={styles.author}>— {teacher.featuredReview.author}</span>
                            </div>
                        ) : (
                            <div className={styles.placeholderReview}>
                                <p>¡Excelente profesional! Súper recomendado.</p>
                            </div>
                        )}

                        <div className={styles.footer}>
                            <span className={styles.count}>{teacher.reviewCount} testimonios</span>
                            <button className={styles.profileLink}>
                                Ver perfil <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
