import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, ScrollText } from 'lucide-react';

const FEATURES = [
  {
    icon: Lock,
    title: 'Secure by default',
    body: 'Passwords never touch our servers in plain text. Sessions live in HTTP-only cookies, invisible to any script.',
  },
  {
    icon: KeyRound,
    title: 'Role-based access',
    body: 'Every request is checked twice — once for who you are, once for what you\'re allowed to do.',
  },
  {
    icon: ScrollText,
    title: 'Full audit trail',
    body: 'Every login, password change, and role update is logged — visible to admins, tamper-evident by design.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2} />
          <span className="font-display font-semibold text-sm tracking-tight">SecureAuth</span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-ink hover:text-accent transition-colors"
        >
          Log in
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <h1 className="font-display font-semibold text-4xl sm:text-5xl tracking-tight max-w-xl mb-4">
          Authentication, built like it matters.
        </h1>
        <p className="text-muted text-base max-w-md mb-8">
          A reference implementation of secure login, role-based access, and audit logging —
          built to be read, not just run.
        </p>
        <div className="flex gap-3">
          <Link
            to="/register"
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Create an account
          </Link>
          <Link
            to="/login"
            className="border border-border text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface transition-colors"
          >
            Log in
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-20">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-surface border border-border rounded-xl p-5">
              <Icon className="w-5 h-5 text-accent mb-3" strokeWidth={1.75} />
              <h3 className="font-display font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
