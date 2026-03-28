import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { PaymentStats, Student } from '../services/api';
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
    const currentMonthTotal = paymentStats?.stats?.[currentMonth]?.total || 0;
    const lastMonthTotal = paymentStats?.stats?.[currentMonth - 1]?.total || 0;
    const monthChange = lastMonthTotal > 0
        ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
        : "0";


    if (loading || !user) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <ProDashboard 
                stats={stats}
                students={students}
                todaysSchedules={todaysSchedules}
                user={user}
                monthChange={monthChange}
                chartData={chartData}
            />
        </Layout>
    );
};

export default Dashboard;
