import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Check, KeyRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userApi';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const unchanged = name.trim() === (user?.name || '');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (name.trim().length === 0) {
      setError('Name cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({ name: name.trim() });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-semibold text-2xl mb-1">Profile</h1>
        <p className="text-sm text-muted mb-8">Manage your account details.</p>

        <div className="bg-surface border border-border rounded-xl p-6 mb-4">
          <h2 className="font-display font-semibold text-sm mb-4">Basic info</h2>
          <form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Full name"
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <p className="text-sm font-mono text-muted px-3 py-2 bg-paper border border-border rounded-lg">
                {user?.email}
              </p>
              <p className="mt-1 text-xs text-muted">Email address can't be changed here.</p>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-danger-bg border border-danger/20 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || unchanged}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover
                disabled:opacity-50 disabled:cursor-not-allowed
                text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {saved && !submitting && <Check className="w-4 h-4" />}
              {submitting ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
            </button>
          </form>
        </div>

        <Link
          to="/change-password"
          className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4
            hover:border-accent transition-colors text-sm"
        >
          <KeyRound className="w-4 h-4 text-accent" />
          <span className="font-medium">Change password</span>
        </Link>
      </main>
    </div>
  );
}
