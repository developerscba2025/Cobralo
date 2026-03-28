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
import RateTeacher from './pages/RateTeacher';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/Toast';
import PublicProfile from './pages/PublicProfile';
import LandingPage from './landing/LandingPage';
import DirectoryPage from './landing/DirectoryPage';
import SubscriptionCallback from './pages/SubscriptionCallback';

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/directorio" element={<DirectoryPage />} />
            <Route path="/app" element={
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
            <Route path="/app/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/rate/:token" element={<RateTeacher />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/subscription-callback" element={
              <PrivateRoute>
                <SubscriptionCallback />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
