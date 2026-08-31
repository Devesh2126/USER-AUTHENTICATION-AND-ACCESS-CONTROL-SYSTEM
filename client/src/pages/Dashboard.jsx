import { User, Shield, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LightPillar from '../components/LightPillar';
import { useAuth } from '../context/AuthContext';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative bg-[#050505] text-white">
      {/* Background Component */}
      <LightPillar
        topColor="#ff0000" // Red
        bottomColor="#20ff00" // Green
        intensity={0.9}
        rotationSpeed={1.5}
        glowAmount={0.008}
        pillarWidth={3.0}
        pillarHeight={0.2}
        noiseIntensity={2}
        pillarRotation={68}
        interactive={false}
      />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-display font-semibold text-3xl mb-1 text-white tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-white/60 text-sm mb-8">Here's where things stand with your account.</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-3">
                <Shield className="w-3.5 h-3.5" />
                Account status
              </div>
              <StatusBadge active={user?.isActive} activeLabel="Active" inactiveLabel="Disabled" />
            </div>

            <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-3">
                <User className="w-3.5 h-3.5" />
                Role
              </div>
              <span className="font-mono text-sm bg-black/50 border border-white/10 text-white rounded px-2 py-1">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 className="font-display font-semibold text-lg mb-6 text-white tracking-tight">Profile Details</h2>
            <dl className="space-y-4 text-sm text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <dt className="text-white/50">Name</dt>
                <dd className="font-medium">{user?.name || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <dt className="text-white/50">Email</dt>
                <dd className="font-mono text-xs">{user?.email}</dd>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <dt className="text-white/50">User ID</dt>
                <dd className="font-mono text-xs text-white/40">{user?.id}</dd>
              </div>
              <div className="flex justify-between items-center pt-1">
                <dt className="text-white/50 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since
                </dt>
                <dd className="font-mono text-xs font-medium">{formatDate(user?.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </main>
      </div>
    </div>
  );
}