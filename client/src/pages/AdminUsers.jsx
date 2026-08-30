import { useState, useEffect, useCallback } from 'react';
import { Search, ShieldAlert, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
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
  // Tracks which row has an action in flight, so we can disable just
  // that row's controls instead of freezing the whole table.
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
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-semibold text-2xl">Users</h1>
            <p className="text-sm text-muted">{total} total</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-sm
                focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent w-56"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-danger-bg border border-danger/20 text-sm text-danger">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    <Loader2 className="w-5 h-5 animate-spin inline" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const rowPending = pendingUserId === u.id;
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        {u.name || <span className="text-muted">—</span>}
                        {isSelf && (
                          <span className="ml-1.5 text-xs text-muted">(you)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isSelf || rowPending}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="font-mono text-xs bg-paper border border-border rounded px-2 py-1
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={isSelf || rowPending}
                          onClick={() => handleStatusToggle(u.id, u.isActive)}
                          className="disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isSelf ? "You can't disable your own account" : undefined}
                        >
                          <StatusBadge
                            active={u.isActive}
                            activeLabel="Active"
                            inactiveLabel="Disabled"
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
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
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-muted font-mono text-xs">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
