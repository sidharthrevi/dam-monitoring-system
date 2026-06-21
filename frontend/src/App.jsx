import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import  Dams from './pages/Dams';
import Readings from './pages/Readings';
import AlertConfig from './pages/AlertConfig';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes — no login required */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
       <Route path="/dams" element={<Dams />} />
      <Route path="/" element={<Dashboard />} />
     
      <Route path="/readings/:damId" element={<Readings />} />
      <Route path="/reports" element={<Reports />} />

      {/* Protected routes — login required */}
      <Route path="/alerts" element={
        <ProtectedRoute roles={['admin']}>
          <AlertConfig />
        </ProtectedRoute>
      } />
      <Route path="/audit-logs" element={
        <ProtectedRoute roles={['admin']}>
          <AuditLogs />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;