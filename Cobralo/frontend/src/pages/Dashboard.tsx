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
    const [hasAgenda, setHasAgenda] = useState(false);
    const [dismissedWizard, setDismissedWizard] = useState(() => localStorage.getItem('wizard_dismissed') === 'true');
    const [pendingAdjustment, setPendingAdjustment] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    const fetchData = async () => {
        try {
            // 1. Fetch critical stats first (fast!)
            const [summary, pStats, subData] = await Promise.all([
                api.getDashboardSummary(),
                api.getPaymentStats(),
                api.getSubscriptionPlans()
            ]);

            setStats({
                paid: summary.pendingAmount > 0 ? (pStats.stats.find((s: any) => s.month === new Date().getMonth() + 1)?.total || 0) : 0, 
                pending: summary.pendingAmount,
                totalStudents: summary.totalStudents
            });
            setPaymentStats(pStats);

            if (subData.pendingAdjustment) {
                setPendingAdjustment(subData.pendingAdjustment);
            }

            // 2. Fetch schedules and full student list (heavier)
            const [studentsData, schedulesData] = await Promise.all([
                api.getStudents(),
                api.getSchedules()
            ]);

            const safeStudents = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data || [];
            setStudents(safeStudents);

            // Re-calc paid accurately if needed (though summary/pStats is usually enough for cards)
            const currentMonth = new Date().getMonth() + 1;
            const currentMonthRealStats = pStats.stats.find((s: any) => s.month === currentMonth);
            const paid = currentMonthRealStats ? currentMonthRealStats.total : 0;

            setStats(prev => ({
                ...prev,
                paid,
                totalStudents: safeStudents.length // sync just in case
            }));

            const now = new Date();
            const today = now.getDay();
            const todayISO = now.toISOString().split('T')[0];
            
            setTodaysSchedules(schedulesData.filter((s: any) => {
                const dayMatch = s.dayOfWeek === today || (today === 0 && s.dayOfWeek === 7);
                if (s.isRecurring) return dayMatch;
                return s.date === todayISO;
            }));

            setHasAgenda(schedulesData.length > 0);

            // 3. Non-critical background fetch
            api.getServices().then(setServices).catch(() => setServices([]));

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
    
    const isWizardComplete = students.length > 0 && services.length > 0 && hasPayments && hasAgenda;
    
    // Automatically flag as dismissed if we mount and they are already complete from a previous session,
    // to avoid bothering existing veterans. But if they just completed it in this session, we show it 
    // at 100% until they click the button.
    const showWizard = !dismissedWizard && (!isWizardComplete || localStorage.getItem('wizard_completed_shown') === 'true');

    if (showWizard && isWizardComplete && localStorage.getItem('wizard_completed_shown') !== 'true') {
        localStorage.setItem('wizard_completed_shown', 'true');
    }

    const handleDismissWizard = () => {
        localStorage.setItem('wizard_dismissed', 'true');
        localStorage.removeItem('wizard_completed_shown'); // cleanup
        setDismissedWizard(true);
    };

    return (
        <Layout>
            {showWizard && (
                <OnboardingWizard 
                    hasServices={services.length > 0} 
                    hasPayments={hasPayments}
                    hasStudents={students.length > 0} 
                    hasAgenda={hasAgenda}
                    onDismiss={handleDismissWizard}
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
