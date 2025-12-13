import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Employees from './pages/Employees'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Yükleniyor...</div>;

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginWrapper />} />
						<Route path="/register" element={<Register />} /> 
                        <Route path="/forgot-password" element={<ForgotPassword />} /> 
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="projects" element={<Projects />} />
                            <Route path="employees" element={<Employees />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    )
}

// Wrapper to redirect if already logged in
function LoginWrapper() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Navigate to="/" /> : <Login />;
}
