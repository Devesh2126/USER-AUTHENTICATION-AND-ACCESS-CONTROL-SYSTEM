import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import FormField from '../components/FormField';
import LightPillar from '../components/LightPillar';
import SpecularButton from '../components/SpecularButton';
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
      <div className="min-h-screen relative bg-[#050505] text-white">
        <LightPillar topColor="#ff0000" bottomColor="#20ff00" intensity={0.9} rotationSpeed={1.5} glowAmount={0.008} pillarWidth={3.0} pillarHeight={0.2} noiseIntensity={2} pillarRotation={68} />
        <div className="relative z-10">
          <Navbar />
          <main className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
            <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <ShieldCheck className="w-12 h-12 text-[#22c55e] mx-auto mb-4" strokeWidth={1.5} />
              <h1 className="font-display font-semibold text-2xl mb-2 tracking-tight">Password changed</h1>
              <p className="text-sm text-white/60 mb-8 leading-relaxed">
                Your password has been updated. You've been kept signed in on this device — any
                other active sessions have been signed out for security.
              </p>
              <SpecularButton onClick={() => navigate('/dashboard')} size="md" radius={12} tint="#ffffff" tintOpacity={1} textColor="#000000" baseColor="#e5e5e5" lineColor="#22c55e">
                Back to dashboard
              </SpecularButton>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-white">
      <LightPillar topColor="#ff0000" bottomColor="#20ff00" intensity={0.9} rotationSpeed={1.5} glowAmount={0.008} pillarWidth={3.0} pillarHeight={0.2} noiseIntensity={2} pillarRotation={68} />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-md mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-display font-semibold text-3xl mb-1 tracking-tight">Change password</h1>
          <p className="text-sm text-white/60 mb-8">
            You'll need to confirm your current password first.
          </p>

          <form onSubmit={handleSubmit} noValidate className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
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
              <ul className="mb-6 -mt-2 space-y-2">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs font-medium ${passed ? 'text-[#22c55e]' : 'text-white/40'
                        }`}
                    >
                      {passed ? (
                        <Check className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4" strokeWidth={3} />
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
              <div className="mb-6 px-4 py-3 rounded-xl bg-danger-bg/10 border border-danger/20 text-sm text-danger font-medium">
                {error}
              </div>
            )}

            <SpecularButton
              type="submit"
              disabled={submitting}
              className="w-full mt-2"
              size="md"
              radius={12}
              tint="#ffffff"
              tintOpacity={1}
              textColor="#000000"
              baseColor="#e5e5e5"
              lineColor="#22c55e"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />}
              {submitting ? 'Updating…' : 'Update password'}
            </SpecularButton>
          </form>
        </main>
      </div>
    </div>
  );
}