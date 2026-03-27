import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Settings from './pages/Settings';
import History from './pages/History';
import Receipts from './pages/Receipts';
import Calendar from './pages/Calendar';
import Expenses from './pages/Expenses';
import RateTeacher from './pages/RateTeacher';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/Toast';
import PublicProfile from './pages/PublicProfile';

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/students" element={
              <PrivateRoute>
                <Students />
              </PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            } />
            <Route path="/receipts" element={
              <PrivateRoute>
                <Receipts />
              </PrivateRoute>
            } />
            <Route path="/calendar" element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            } />
            <Route path="/expenses" element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/rate/:token" element={<RateTeacher />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
