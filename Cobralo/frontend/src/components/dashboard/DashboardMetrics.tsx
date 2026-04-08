import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart3 } from 'lucide-react';
import type { Student } from '../../services/api';

interface DashboardMetricsProps {
    students: Student[];
    currency?: string;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ students }) => {
    const todayDate = new Date().getDate();
    
    // 1. Upcoming Expirations logic
    const upcomingStudents = students.filter(s => {
        if (s.status === 'pending' || !s.due_day) return false;
        let diff = s.due_day - todayDate;
        if (diff < 0) diff += 30;
        return diff > 0 && diff <= 5;
    }).sort((a, b) => {
        let diffA = (a.due_day || 0) - todayDate;
        if (diffA < 0) diffA += 30;
        let diffB = (b.due_day || 0) - todayDate;
        if (diffB < 0) diffB += 30;
        return diffA - diffB;
    });

    // 2. Service Distribution logic
    const serviceMap = new Map<string, { count: number; amount: number }>();
    students.forEach(s => {
        const svc = s.service_name || 'Sin servicio';
        const existing = serviceMap.get(svc) || { count: 0, amount: 0 };
        serviceMap.set(svc, { count: existing.count + 1, amount: existing.amount + Number(s.amount || 0) });
    });
    const serviceColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
    const serviceData = Array.from(serviceMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, data], i) => ({ name, ...data, color: serviceColors[i % serviceColors.length] }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Próximos Vencimientos */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-[28px] border border-border-main bg-surface dark:bg-bg-soft shadow-sm p-5 md:p-7">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-text-main uppercase tracking-widest">Próximos Vencimientos</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Clock size={14} className="text-amber-500" />
                    </div>
                </div>
                {upcomingStudents.length === 0 ? (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                        <p className="text-[13px] font-black text-text-main uppercase tracking-tight">Todo Tranquilo</p>
                        <p className="text-[10px] font-bold text-text-muted mt-1">Nadie vence pronto.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {upcomingStudents.slice(0, 4).map(student => {
                            let diff = (student.due_day || 0) - todayDate;
                            if (diff < 0) diff += 30;
                            return (
                                <div key={student.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/[0.07] border border-black/8 dark:border-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.12] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-[11px] shrink-0">
                                            {(student.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-text-main leading-none truncate">{student.name}</p>
                                            <p className="text-[10px] font-bold text-text-muted mt-0.5 truncate">{student.service_name}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg whitespace-nowrap">
                                        En {diff} d
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Distribución por servicio */}
            <div className="relative overflow-hidden rounded-[28px] border border-border-main bg-surface dark:bg-bg-soft shadow-sm p-5 md:p-7">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-text-main uppercase tracking-widest text-nowrap">Por Servicio</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <BarChart3 size={14} className="text-blue-500" />
                    </div>
                </div>
                {serviceData.length === 0 ? (
                    <p className="text-sm text-text-muted font-bold">Sin datos</p>
                ) : (
                    <div className="space-y-3 mt-2">
                        {serviceData.map((svc, i) => {
                            const maxCount = serviceData[0].count;
                            const pct = maxCount > 0 ? (svc.count / maxCount) * 100 : 0;
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold text-text-main truncate max-w-[120px]">{svc.name}</span>
                                        <span className="text-[10px] font-black text-text-muted">{svc.count} al.</span>
                                    </div>
                                    <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${pct}%` }} 
                                            className="h-full rounded-full" 
                                            style={{ backgroundColor: svc.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardMetrics;
