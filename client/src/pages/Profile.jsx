import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, KeyRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import FormField from '../components/FormField';
import LightPillar from '../components/LightPillar';
import SpecularButton from '../components/SpecularButton';
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
    <div className="min-h-screen relative bg-[#050505] text-white">
      <LightPillar topColor="#ff0000" bottomColor="#20ff00" intensity={0.9} rotationSpeed={1.5} glowAmount={0.008} pillarWidth={3.0} pillarHeight={0.2} noiseIntensity={2} pillarRotation={68} />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-display font-semibold text-3xl mb-1 tracking-tight">Profile</h1>
          <p className="text-sm text-white/60 mb-8">Manage your account details.</p>

          <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl">
            <h2 className="font-display font-semibold text-lg mb-6 tracking-tight">Basic info</h2>
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-white/90 mb-1.5">Email</label>
                <p className="text-sm font-mono text-white px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl">
                  {user?.email}
                </p>
                <p className="mt-1.5 text-xs text-white/40">Email address can't be changed here.</p>
              </div>

              {error && (
                <div className="mb-6 px-3 py-2 rounded-lg bg-danger-bg/10 border border-danger/20 text-sm text-danger">
                  {error}
                </div>
              )}

              <SpecularButton
                type="submit"
                disabled={submitting || unchanged}
                className="w-full"
                size="md"
                radius={12}
                tint="#ffffff"
                tintOpacity={1}
                textColor="#000000"
                baseColor="#e5e5e5"
                lineColor="#22c55e"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />}
                {submitting ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
              </SpecularButton>
            </form>
          </div>

          <Link
            to="/change-password"
            className="flex items-center gap-3 bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5
              hover:border-white/30 transition-colors shadow-2xl"
          >
            <div className="bg-white/10 p-2 rounded-lg">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-medium block text-white">Change password</span>
              <span className="text-xs text-white/50 block mt-0.5">Update your security credentials</span>
            </div>
          </Link>
        </main>
      </div>
    </div>
  );
}