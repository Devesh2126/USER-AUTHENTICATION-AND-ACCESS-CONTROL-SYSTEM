import { ShieldCheck, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2} />
            <span className="font-display font-semibold text-sm tracking-tight">SecureAuth</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-muted hover:text-ink transition-colors">
              Dashboard
            </Link>
            <Link to="/profile" className="text-muted hover:text-ink transition-colors">
              Profile
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin/users" className="text-muted hover:text-ink transition-colors">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted hidden sm:inline">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
