import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldAlert, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LightPillar from '../components/LightPillar';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, updateUserRole, updateUserStatus } from '../services/adminApi';

const ROLES = ['USER', 'ADMIN', 'MODERATOR'];
const PAGE_SIZE = 20;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchUsers({ page, limit: PAGE_SIZE, search });
      setUsers(result.users);
      setTotal(result.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(userId, newRole) {
    setPendingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleStatusToggle(userId, currentlyActive) {
    setPendingUserId(userId);
    try {
      await updateUserStatus(userId, !currentlyActive);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentlyActive } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setPendingUserId(null);
    }
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="min-h-screen relative bg-[#050505] text-white">
      <LightPillar topColor="#ff0000" bottomColor="#20ff00" intensity={0.9} rotationSpeed={1.5} glowAmount={0.008} pillarWidth={3.0} pillarHeight={0.2} noiseIntensity={2} pillarRotation={68} />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-semibold text-3xl tracking-tight">Users</h1>
              <p className="text-sm text-white/50">{total} total members</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-[#18181b]/80 backdrop-blur-md text-sm text-white
                  focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-bg/10 border border-danger/20 text-sm text-danger font-medium">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-x-auto shadow-2xl">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40 bg-white/5">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const rowPending = pendingUserId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          {u.name || <span className="text-white/30">—</span>}
                          {isSelf && (
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/30">You</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-white/60">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            disabled={isSelf || rowPending}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="font-mono text-xs bg-[#18181b] border border-white/10 rounded-lg px-3 py-1.5 text-white
                              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            disabled={isSelf || rowPending}
                            onClick={() => handleStatusToggle(u.id, u.isActive)}
                            className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title={isSelf ? "You can't disable your own account" : undefined}
                          >
                            <StatusBadge
                              active={u.isActive}
                              activeLabel="Active"
                              inactiveLabel="Disabled"
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-white/50">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-white/50 font-mono text-xs font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}