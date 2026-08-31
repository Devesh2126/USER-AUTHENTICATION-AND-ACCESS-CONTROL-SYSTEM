import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import SpecularButton from '../components/SpecularButton';
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
          <Link to="/forgot-password" className="text-xs text-[#8b5cf6] hover:text-[#c084fc] transition-colors">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-danger-bg/10 border border-danger/20 text-sm text-danger">
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
                    className="text-xs font-medium text-danger underline hover:no-underline disabled:opacity-60 cursor-pointer"
                  >
                    {resendState === 'sending' ? 'Sending…' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <SpecularButton
          type="submit"
          disabled={submitting}
          className="w-full mt-4"
          size="md"
          radius={12}
          tint="#ffffff"
          tintOpacity={1} /* Solid white button */
          textColor="#000000" /* Black text */
          baseColor="#e5e5e5"
          lineColor="#8b5cf6" /* Purple highlight to match threads */
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </SpecularButton>
      </form>

      <p className="mt-6 text-sm text-white/50 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#8b5cf6] font-medium hover:text-[#c084fc] transition-colors">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}