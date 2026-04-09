import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { PaymentStats, Student } from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import ProDashboard from './ProDashboard';
import BasicDashboard from './BasicDashboard';
import { showToast } from '../components/Toast';
import OnboardingWizard from '../components/dashboard/OnboardingWizard';

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<{ paid: number; pending: number; totalStudents: number }>({
        paid: 0,
        pending: 0,
        totalStudents: 0
    });
    const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
    const [todaysSchedules, setTodaysSchedules] = useState<any[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [pendingAdjustment, setPendingAdjustment] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    const fetchData = async () => {
        try {
            const [studentsData, pStats, schedulesData, subData] = await Promise.all([
                api.getStudents(),
                api.getPaymentStats(),
                api.getSchedules(),
                api.getSubscriptionPlans()
            ]);

            const safeStudents = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || [];
            
            setStudents(safeStudents);
            setPaymentStats(pStats);

            // Non-critical: fetch services for onboarding wizard
            try {
                const servicesData = await api.getServices();
                setServices(servicesData);
            } catch {
                setServices([]);
            }

            const now = new Date();
            const currentMonth = now.getMonth() + 1;

            // REAL INCOME: Sum of payments this month
            const currentMonthRealStats = pStats.stats.find((s: any) => s.month === currentMonth);
            const paid = currentMonthRealStats ? currentMonthRealStats.total : 0;

            // PENDING: Still based on theoretical student amount sum
            const pending = safeStudents
                .filter((s: Student) => s.status === 'pending')
                .reduce((acc: number, s: Student) => acc + Number(s.amount || 0), 0);

            setStats({
                paid,
                pending,
                totalStudents: safeStudents.length
            });

            const today = now.getDay();
            const todayISO = now.toISOString().split('T')[0];
            
            // Fix: Filter by recurrence and exact date
            setTodaysSchedules(schedulesData.filter((s: any) => {
                const dayMatch = s.dayOfWeek === today || (today === 0 && s.dayOfWeek === 7);
                if (s.isRecurring) return dayMatch;
                return s.date === todayISO;
            }));

            if (subData.pendingAdjustment) {
                setPendingAdjustment(subData.pendingAdjustment);
            }
        } catch (error) {
            console.error("Error loading stats:", error);
            showToast.error("Error al cargar datos del Dashboard. Verificá tu conexión.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Prepare chart data
    const chartData = paymentStats?.stats.map((s) => ({
        name: MONTHS_SHORT[s.month - 1],
        ingresos: s.total,
        pagos: s.count
    })) || [];

    // Current month stats
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentMonthTotal = paymentStats?.stats?.find(s => s.month === currentMonthNum)?.total || 0;
    
    // Last month stats
    let lastMonthNum = currentMonthNum - 1;
    if (lastMonthNum === 0) lastMonthNum = 12;
    const lastMonthTotal = paymentStats?.stats?.find(s => s.month === lastMonthNum)?.total || 0;

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

    const hasPayments = (user?.paymentAccounts && user.paymentAccounts.length > 0) || !!user?.mpAccessToken;
    const showWizard = students.length === 0 || services.length === 0 || !hasPayments;

    return (
        <Layout>
            {showWizard && (
                <OnboardingWizard 
                    hasServices={services.length > 0} 
                    hasPayments={hasPayments}
                    hasStudents={students.length > 0} 
                />
            )}
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
                    todaysSchedules={todaysSchedules}
                    user={user}
                    pendingAdjustment={pendingAdjustment}
                    onAction={fetchData}
                />
            )}
        </Layout>
    );
};

export default Dashboard;
