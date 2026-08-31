import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({ label, id, error, type, ...inputProps }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          /* Solid dark background matching the modern aesthetic */
          className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-[#18181b] text-white 
            placeholder:text-white/30
            focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-danger' : 'border-white/5'}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
