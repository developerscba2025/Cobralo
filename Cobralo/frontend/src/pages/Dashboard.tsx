import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { PaymentStats, Student } from '../services/api';
import FreeDashboard from './FreeDashboard';
import ProDashboard from './ProDashboard';

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        paid: 0,
        pending: 0,
        totalStudents: 0
    });
    const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [todaysSchedules, setTodaysSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // WhatsApp link generator (memoized)
    const generateWaLink = useCallback((student: Student) => {
        const baseAmount = Number(student.amount) || 0;
        const alias = user?.bizAlias || 'Alias';
        const defaultTemplate = `Hola {alumno}! Te saluda {negocio}. Te envío el link de pago de {servicio} por un total de ${user?.currency || '$'}{monto}. Mi alias de {metodo} es: {alias}. ¡Muchas gracias!`;
        const template = user?.reminderTemplate || defaultTemplate;
        const message = template
            .replace('{alumno}', student.name)
            .replace('{monto}', baseAmount.toLocaleString('es-AR'))
            .replace('{negocio}', user?.bizName || 'Tu Profe')
            .replace('{servicio}', student.service_name || '')
            .replace('{alias}', student.billing_alias || alias)
            .replace('{metodo}', student.payment_method || '');
        return `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentsData = await api.getStudents();
                setStudents(studentsData);

                const paid = studentsData
                    .filter(s => s.status === 'paid')
                    .reduce((acc, s) => acc + Number(s.amount || 0), 0);

                const pending = studentsData
                    .filter(s => s.status === 'pending')
                    .reduce((acc, s) => acc + Number(s.amount || 0), 0);

                setStats({
                    paid,
                    pending,
                    totalStudents: studentsData.length
                });

                const pStats = await api.getPaymentStats();
                setPaymentStats(pStats);

                const schedules = await api.getSchedules();
                const today = new Date().getDay();
                setTodaysSchedules(schedules.filter((s: any) => s.dayOfWeek === today));

            } catch (error) {
                console.error("Error loading stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Prepare chart data
    const chartData = paymentStats?.stats.map((s, i) => ({
        name: MONTHS_SHORT[i],
        ingresos: s.total,
        pagos: s.count
    })) || [];

    // Current month stats
    const currentMonth = new Date().getMonth();
    const currentMonthTotal = paymentStats?.stats[currentMonth]?.total || 0;
    const lastMonthTotal = paymentStats?.stats[currentMonth - 1]?.total || 0;
    const monthChange = lastMonthTotal > 0
        ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
        : 0;

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {!user?.isPro ? (
                <FreeDashboard 
                    stats={stats}
                    students={students}
                    user={user}
                />
            ) : (
                <ProDashboard 
                    stats={stats}
                    paymentStats={paymentStats}
                    students={students}
                    todaysSchedules={todaysSchedules}
                    user={user}
                    monthChange={monthChange}
                    chartData={chartData}
                    generateWaLink={generateWaLink}
                />
            )}
        </Layout>
    );
};

export default Dashboard;
