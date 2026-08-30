import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="flex items-center gap-2 justify-center mb-8 hover:opacity-70 transition-opacity"
        >
          <ShieldCheck className="w-6 h-6 text-accent" strokeWidth={2} />
          <span className="font-display font-semibold text-lg tracking-tight">
            SecureAuth
          </span>
        </Link>

        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
          <h1 className="font-display font-semibold text-xl mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-muted mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
