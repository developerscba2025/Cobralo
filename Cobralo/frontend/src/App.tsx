import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Settings from './pages/Settings';
import History from './pages/History';
import Receipts from './pages/Receipts';
import Calendar from './pages/Calendar';
import Classes from './pages/Classes';
import RateTeacher from './pages/RateTeacher';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/Toast';
import PublicProfile from './pages/PublicProfile';
import SubscriptionCallback from './pages/SubscriptionCallback';
import LandingPage from './landing/LandingPage';
import DirectoryPage from './landing/DirectoryPage';

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            {/* Landing & Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/directorio" element={<DirectoryPage />} />
            <Route path="/rate/:token" element={<RateTeacher />} />
            <Route path="/profile/:id" element={<PublicProfile />} />

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
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
