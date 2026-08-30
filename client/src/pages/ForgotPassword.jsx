import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      // The endpoint always returns success regardless of outcome
      // (account-enumeration protection) — so there's no meaningful
      // error state to show here, by design.
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center py-2">
          <MailCheck className="w-10 h-10 text-accent mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-muted mb-6">
            If an account exists for <span className="text-ink font-medium">{email}</span>,
            we've sent a link to reset your password.
          </p>
          <Link to="/login" className="text-accent text-sm font-medium hover:underline">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
    >
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover
            disabled:opacity-60 disabled:cursor-not-allowed
            text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted text-center">
        Remembered it?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
