import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import SpecularButton from '../components/SpecularButton';
import api from '../services/api';
import { PASSWORD_RULES, isPasswordValid } from '../utils/passwordRules';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tokenHash, setTokenHash] = useState(searchParams.get('token_hash') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tokenHash && location.hash) {
      const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
      const hashToken = hashParams.get('token_hash');
      if (hashToken) {
        setTokenHash(hashToken);
      }
    }
  }, [location, tokenHash]);

  const passwordValid = isPasswordValid(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  if (!tokenHash) {
    return (
      <AuthLayout title="Invalid link">
        <div className="text-center py-2">
          <ShieldAlert className="w-10 h-10 text-danger mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-white/70 mb-6">
            This password reset link is missing or malformed. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

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
      await api.post('/auth/reset-password', { tokenHash, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthLayout title="Password reset">
        <div className="text-center py-2">
          <ShieldCheck className="w-10 h-10 text-success mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-white/70 mb-6">
            Your password has been updated. Any other active sessions have been signed out —
            please log in again with your new password.
          </p>
          <SpecularButton
            onClick={() => navigate('/login')}
            size="md"
            tint="#4338ca"
            tintOpacity={0.2}
            lineColor="#863bff"
          >
            Go to login
          </SpecularButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose something you haven't used before.">
      <form onSubmit={handleSubmit} noValidate>
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
                  className={`flex items-center gap-1.5 text-xs ${passed ? 'text-success' : 'text-white/40'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-success' : 'bg-white/40'}`} />
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
          <div className="mb-4 px-3 py-2 rounded-lg bg-danger-bg/10 border border-danger/20 text-sm text-danger">
            {error}
          </div>
        )}

        <SpecularButton
          type="submit"
          disabled={submitting}
          className="w-full mt-4"
          size="md"
          tint="#4338ca"
          tintOpacity={0.2}
          lineColor="#863bff"
        >
          {submitting ? 'Resetting…' : 'Reset password'}
        </SpecularButton>
      </form>
    </AuthLayout>
  );
}