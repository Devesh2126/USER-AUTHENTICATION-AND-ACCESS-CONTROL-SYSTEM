import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendState, setResendState] = useState('idle'); // idle | sending | sent

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setResendState('idle');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Backend deliberately returns a generic message for bad
      // credentials (account enumeration protection) — we just surface
      // whatever it sent rather than inventing our own wording.
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setErrorCode(err.response?.data?.code || '');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResendState('sending');
    try {
      await api.post('/auth/resend-verification', { email });
      setResendState('sent');
    } catch {
      // Resend endpoint always returns success regardless of outcome
      // (enumeration protection) — a network-level failure here is the
      // only realistic error path, so just let them try again.
      setResendState('idle');
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back. Enter your details to continue.">
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="-mt-2 mb-4 text-right">
          <Link to="/forgot-password" className="text-xs text-accent hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-danger-bg border border-danger/20 text-sm text-danger">
            <p>{error}</p>

            {errorCode === 'EMAIL_NOT_CONFIRMED' && (
              <div className="mt-2 pt-2 border-t border-danger/20">
                {resendState === 'sent' ? (
                  <p className="flex items-center gap-1.5 text-success text-xs font-medium">
                    <MailCheck className="w-3.5 h-3.5" />
                    Confirmation email sent — check your inbox.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendState === 'sending'}
                    className="text-xs font-medium text-danger underline hover:no-underline disabled:opacity-60"
                  >
                    {resendState === 'sending' ? 'Sending…' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}
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
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
