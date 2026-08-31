import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import WebThreads from './WebThreads';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative text-paper bg-[#050505]">

      {/* WebThreads Background matching the first picture */}
      <div className="fixed inset-0 z-0">
        <WebThreads
          color1="#8b5cf6" // Deep vibrant purple
          color2="#c084fc" // Lighter glowing purple
          color3="#ffffff" // Hot white core
          backgroundColor="#050505" // Pitch black background
          grain={true}
          grainIntensity={0.08}
          mouseInteraction={true}
          mouseStrength={0.4}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 hover:opacity-80 transition-opacity">
          <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
          <span className="font-display font-semibold text-xl tracking-tight text-white">
            SecureAuth
          </span>
        </Link>

        {/* Ultra-dark Glassmorphic Card */}
        <div className="bg-[#0f0f11]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="font-display font-semibold text-2xl mb-1 text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-white/50 mb-6">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}