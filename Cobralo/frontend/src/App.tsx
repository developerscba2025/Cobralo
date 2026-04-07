import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/Toast';
import LoadingFallback from './components/LoadingFallback';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Settings = lazy(() => import('./pages/Settings'));
const History = lazy(() => import('./pages/History'));
const Receipts = lazy(() => import('./pages/Receipts'));
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

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastContainer />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Landing & Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/directorio" element={<DirectoryPage />} />
              <Route path="/rate/:token" element={<RateTeacher />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              {/* Public attendance confirmation pages */}
              <Route path="/confirmar/:token" element={<AttendanceConfirmPage mode="confirm" />} />
              <Route path="/cancelar/:token" element={<AttendanceConfirmPage mode="cancel" />} />
              <Route path="/payment-success" element={<StudentPaymentSuccess />} />

              {/* Auth Routes */}
              <Route path="/app/login" element={<Login />} />
              <Route path="/app/forgot-password" element={<ForgotPassword />} />
              <Route path="/app/reset-password" element={<ResetPassword />} />

              {/* Dashboard Private Routes */}
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/app/students" element={
                <PrivateRoute>
                  <Students />
                </PrivateRoute>
              } />
              <Route path="/app/history" element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              } />
              <Route path="/app/receipts" element={
                <PrivateRoute>
                  <Receipts />
                </PrivateRoute>
              } />
              <Route path="/app/calendar" element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              } />
              <Route path="/app/classes" element={
                <PrivateRoute>
                  <Classes />
                </PrivateRoute>
              } />
              <Route path="/app/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
              <Route path="/app/notifications" element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              } />
              <Route path="/app/subscription-callback" element={
                <PrivateRoute>
                  <SubscriptionCallback />
                </PrivateRoute>
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
              
              {/* 404/Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
