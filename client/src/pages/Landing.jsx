import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, ScrollText } from 'lucide-react';
import GlowCursor from '../components/GlowCursor';
import FloatingLines from '../components/FloatingLines';
import SpecularButton from '../components/SpecularButton';

const FEATURES = [
  {
    icon: Lock,
    title: 'Secure by default',
    body: 'Passwords never touch our servers in plain text. Sessions live in HTTP-only cookies, invisible to any script.',
  },
  {
    icon: KeyRound,
    title: 'Role-based access',
    body: "Every request is checked twice — once for who you are, once for what you're allowed to do.",
  },
  {
    icon: ScrollText,
    title: 'Full audit trail',
    body: 'Every login, password change, and role update is logged — visible to admins, tamper-evident by design.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <GlowCursor
      color="#4338ca"
      secondaryColor="#863bff"
      className="min-h-screen bg-ink text-paper relative selection:bg-accent/30"
    >
      {/* FIXED positioning keeps this covering the screen even when scrolling */}
      <div className="fixed inset-0 z-0 opacity-60 pointer-events-none">
        <FloatingLines
          linesGradient={['#4338ca', '#863bff']}
          backgroundColor="#14171f"
          interactive={true}
        />
      </div>

      <div className="relative z-10">
        <header className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2} />
            <span className="font-display font-semibold text-sm tracking-tight text-white">SecureAuth</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-paper hover:text-accent transition-colors cursor-pointer"
          >
            Log in
          </button>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <h1 className="font-display font-semibold text-4xl sm:text-5xl tracking-tight max-w-xl mb-4 text-white">
            Authentication, built like it matters.
          </h1>
          <p className="text-white/70 text-base max-w-md mb-8">
            A reference implementation of secure login, role-based access, and audit logging —
            built to be read, not just run.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <SpecularButton
              onClick={() => navigate('/register')}
              size="lg"
              tint="#4338ca"
              tintOpacity={0.2}
              lineColor="#863bff"
            >
              Create an account
            </SpecularButton>

            <SpecularButton
              onClick={() => navigate('/login')}
              size="lg"
              baseColor="#1e1e2e"
              lineColor="#ffffff"
              tintOpacity={0}
            >
              Log in
            </SpecularButton>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-20">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg"
              >
                <Icon className="w-5 h-5 text-accent mb-3" strokeWidth={1.75} />
                <h3 className="font-display font-semibold text-sm mb-1.5 text-white">{title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </GlowCursor>
  );
}