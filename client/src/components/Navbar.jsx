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
    <div className="pt-6 px-4 sm:px-6 relative z-50 mb-6">
      {/* Floating Glassmorphic Pill */}
      <header className="max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#0f0f11]/60 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group transition-all duration-300 hover:bg-[#0f0f11]/80">

        {/* Animated Ambient Glow (Matches the LightPillar Colors) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40">
          <div className="absolute -left-20 -top-20 w-48 h-48 bg-[#ff0000] rounded-full blur-[70px] animate-pulse"></div>
          <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-[#20ff00] rounded-full blur-[70px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">

            {/* Logo with Hover Animation */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group/logo">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover/logo:bg-white/10 group-hover/logo:border-[#20ff00]/30 transition-all">
                <ShieldCheck className="w-5 h-5 text-[#20ff00]" strokeWidth={2.5} />
              </div>
              <span className="font-display font-semibold text-base tracking-tight text-white group-hover/logo:text-[#20ff00] transition-colors">
                SecureAuth
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link to="/dashboard" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
                Dashboard
              </Link>
              <Link to="/profile" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
                Profile
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin/users" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* User Email Pill */}
            <span className="text-xs font-mono text-white/40 hidden md:inline px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
              {user?.email}
            </span>

            {/* Animated Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all cursor-pointer group/logout"
            >
              <LogOut className="w-4 h-4 group-hover/logout:scale-110 transition-transform" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}