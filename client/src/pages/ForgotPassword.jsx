import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import SpecularButton from '../components/SpecularButton';
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
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center py-2">
          <MailCheck className="w-10 h-10 text-accent mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-white/70 mb-6">
            If an account exists for <span className="text-white font-medium">{email}</span>,
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

        <SpecularButton
          type="submit"
          disabled={submitting}
          className="w-full mt-4"
          size="md"
          tint="#4338ca"
          tintOpacity={0.2}
          lineColor="#863bff"
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </SpecularButton>
      </form>

      <p className="mt-6 text-sm text-white/60 text-center">
        Remembered it?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}