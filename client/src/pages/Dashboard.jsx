import { User, Shield, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
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
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-semibold text-2xl mb-1">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted text-sm mb-8">Here's where things stand with your account.</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wide mb-3">
              <Shield className="w-3.5 h-3.5" />
              Account status
            </div>
            <StatusBadge active={user?.isActive} activeLabel="Active" inactiveLabel="Disabled" />
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wide mb-3">
              <User className="w-3.5 h-3.5" />
              Role
            </div>
            <span className="font-mono text-sm bg-paper border border-border rounded px-2 py-0.5">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="font-display font-semibold text-sm mb-4">Profile</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-muted">Name</dt>
              <dd>{user?.name || '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-muted">Email</dt>
              <dd className="font-mono text-xs">{user?.email}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-muted">User ID</dt>
              <dd className="font-mono text-xs text-muted">{user?.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member since
              </dt>
              <dd className="font-mono text-xs">{formatDate(user?.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
