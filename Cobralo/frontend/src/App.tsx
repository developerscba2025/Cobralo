import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/Toast';
import LoadingFallback from './components/LoadingFallback';

// Generic Loading Spinner for Public Routes
const GenericLoading = () => (
  <div className="min-h-screen bg-bg-app flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-main/20 border-t-primary-main rounded-full animate-spin" />
  </div>
);

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Settings = lazy(() => import('./pages/Settings'));
const Payments = lazy(() => import('./pages/Payments'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Classes = lazy(() => import('./pages/Classes'));
const RateTeacher = lazy(() => import('./pages/RateTeacher'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const SubscriptionCallback = lazy(() => import('./pages/SubscriptionCallback'));
const LandingPage = lazy(() => import('./landing/LandingPage'));
const DirectoryPage = lazy(() => import('./landing/DirectoryPage'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const AttendanceConfirmPage = lazy(() => import('./pages/AttendanceConfirmPage'));
const StudentPaymentSuccess = lazy(() => import('./pages/StudentPaymentSuccess'));
const Support = lazy(() => import('./pages/Support'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            {/* Landing & Public Routes - Neutral Generic Spinner */}
            <Route path="/" element={
              <Suspense fallback={<GenericLoading />}>
                <LandingPage />
              </Suspense>
            } />
            <Route path="/directorio" element={
              <Suspense fallback={<GenericLoading />}>
                <DirectoryPage />
              </Suspense>
            } />
            <Route path="/rate/:token" element={
              <Suspense fallback={<GenericLoading />}>
                <RateTeacher />
              </Suspense>
            } />
            <Route path="/profile/:id" element={
              <Suspense fallback={<GenericLoading />}>
                <PublicProfile />
              </Suspense>
            } />
            <Route path="/confirmar/:token" element={
              <Suspense fallback={<GenericLoading />}>
                <AttendanceConfirmPage mode="confirm" />
              </Suspense>
            } />
            <Route path="/cancelar/:token" element={
              <Suspense fallback={<GenericLoading />}>
                <AttendanceConfirmPage mode="cancel" />
              </Suspense>
            } />
            <Route path="/payment-success" element={
              <Suspense fallback={<GenericLoading />}>
                <StudentPaymentSuccess />
              </Suspense>
            } />

            {/* Private App Routes - Dashboard Skeleton Fallback */}
            <Route path="/app/*" element={
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="login" element={<Login />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />

                  <Route path="/" element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="students" element={
                    <PrivateRoute>
                      <Students />
                    </PrivateRoute>
                  } />
                  <Route path="payments" element={
                    <PrivateRoute>
                      <Payments />
                    </PrivateRoute>
                  } />
                  <Route path="history" element={<Navigate to="/app/payments?tab=history" replace />} />
                  <Route path="receipts" element={<Navigate to="/app/payments?tab=receipts" replace />} />
                  <Route path="calendar" element={
                    <PrivateRoute>
                      <Calendar />
                    </PrivateRoute>
                  } />
                  <Route path="classes" element={
                    <PrivateRoute>
                      <Classes />
                    </PrivateRoute>
                  } />
                  <Route path="settings" element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } />
                  <Route path="notifications" element={
                    <PrivateRoute>
                      <NotificationsPage />
                    </PrivateRoute>
                  } />
                  <Route path="subscription-callback" element={
                    <PrivateRoute>
                      <SubscriptionCallback />
                    </PrivateRoute>
                  } />
                  <Route path="support" element={
                    <PrivateRoute>
                      <Support />
                    </PrivateRoute>
                  } />
                  <Route path="admin" element={
                    <PrivateRoute>
                      <AdminPanel />
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            } />

            {/* Redirecciones de Compatibilidad */}
            <Route path="/app/rate/:token" element={<Navigate to="/rate/:token" replace />} />
            <Route path="/app/profile/:id" element={<Navigate to="/profile/:id" replace />} />
            
            <Route path="/login" element={<Navigate to="/app/login" replace />} />
            <Route path="/register" element={<Navigate to="/app/login?register=true" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/app/forgot-password" replace />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/students" element={<Navigate to="/app/students" replace />} />
            <Route path="/calendar" element={<Navigate to="/app/calendar" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
            
            <Route path="*" element={
              <Suspense fallback={<GenericLoading />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
