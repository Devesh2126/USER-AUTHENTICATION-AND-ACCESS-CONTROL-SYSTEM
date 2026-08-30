import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading state prevents a flash of the login page while we're still
// checking whether a session cookie exists — without this, every reload
// would briefly show "logged out" even for an already-logged-in user.
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

// IMPORTANT: this check is a UX convenience only — it hides admin nav
// items from users who shouldn't see them. It is NOT a security boundary.
// requireRole('ADMIN') on the backend is what actually protects admin
// data; even if someone bypassed this component entirely, every admin
// API call would still be rejected server-side.
export function AdminRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return children;
}
