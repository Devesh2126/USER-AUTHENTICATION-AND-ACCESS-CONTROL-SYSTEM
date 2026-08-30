import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import FormField from '../components/FormField';
import { changePassword } from '../services/userApi';
import { PASSWORD_RULES, isPasswordValid } from '../utils/passwordRules';

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordValid = isPasswordValid(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Please meet all password requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="max-w-md mx-auto px-4 sm:px-6 py-10 text-center">
          <ShieldCheck className="w-10 h-10 text-success mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-display font-semibold text-xl mb-2">Password changed</h1>
          <p className="text-sm text-muted mb-6">
            Your password has been updated. You've been kept signed in on this device — any
            other active sessions have been signed out for security.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Back to dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-semibold text-2xl mb-1">Change password</h1>
        <p className="text-sm text-muted mb-8">
          You'll need to confirm your current password first.
        </p>

        <form onSubmit={handleSubmit} noValidate className="bg-surface border border-border rounded-xl p-6">
          <FormField
            label="Current password"
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <FormField
            label="New password"
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          {newPassword.length > 0 && (
            <ul className="mb-4 -mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(newPassword);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      passed ? 'text-success' : 'text-muted'
                    }`}
                  >
                    {passed ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}

          <FormField
            label="Confirm new password"
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined
            }
            required
          />

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-danger-bg border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover
              disabled:opacity-60 disabled:cursor-not-allowed
              text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </main>
    </div>
  );
}
