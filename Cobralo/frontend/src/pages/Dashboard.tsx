import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { PaymentStats, Student } from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import ProDashboard from './ProDashboard';
import BasicDashboard from './BasicDashboard';

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        paid: 0,
        pending: 0,
        totalStudents: 0
    });
    const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
    const [todaysSchedules, setTodaysSchedules] = useState<any[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [pendingAdjustment, setPendingAdjustment] = useState<any>(null);
    const [loading, setLoading] = useState(true);


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
            setTodaysSchedules(schedules.filter((s: any) => s.dayOfWeek === today || (today === 0 && s.dayOfWeek === 7)));

            const subData = await api.getSubscriptionPlans();
            if (subData.pendingAdjustment) {
                setPendingAdjustment(subData.pendingAdjustment);
            }


        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
        : currentMonthTotal > 0 ? "100.0" : "0.0";


    if (loading || !user) {
        return (
            <Layout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Fake Header Skeletons */}
                    <SkeletonCard variant="stat" count={3} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <SkeletonCard variant="chart" count={2} />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {user.plan === 'PRO' ? (
                <ProDashboard 
                    stats={stats}
                    students={students}
                    todaysSchedules={todaysSchedules}
                    user={user}
                    monthChange={monthChange}
                    chartData={chartData}
                    pendingAdjustment={pendingAdjustment}
                    onAction={fetchData}
                />
            ) : (
                <BasicDashboard 
                    stats={stats}
                    students={students}
                    user={user}
                    pendingAdjustment={pendingAdjustment}
                    onAction={fetchData}
                />
            )}
        </Layout>
    );
};

export default Dashboard;
