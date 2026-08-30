import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Check, X, MailCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { PASSWORD_RULES, isPasswordValid } from '../utils/passwordRules';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const passwordValid = isPasswordValid(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

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
      const result = await register(email, password, name);
      if (result.data?.requiresEmailConfirmation) {
        setNeedsConfirmation(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center py-2">
          <MailCheck className="w-10 h-10 text-accent mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-sm text-muted mb-6">
            We've sent a confirmation link to <span className="text-ink font-medium">{email}</span>.
            Click it, then come back and log in.
          </p>
          <Link
            to="/login"
            className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Go to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create an account" subtitle="Start by telling us a bit about you.">
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Full name"
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {password.length > 0 && (
          <ul className="mb-4 -mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.test(password);
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
          label="Confirm password"
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
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
