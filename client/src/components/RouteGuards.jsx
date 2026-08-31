import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="font-mono text-sm text-muted">Checking session…</div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}
