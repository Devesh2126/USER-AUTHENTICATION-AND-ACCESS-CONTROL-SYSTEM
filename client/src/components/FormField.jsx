import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({ label, id, error, type, ...inputProps }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  // Toggling swaps the actual input type between 'password' and 'text' —
  // there's no native "reveal" attribute, this is the standard approach.
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={resolvedType}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-3 py-2 rounded-lg border text-sm bg-surface
            placeholder:text-muted/70
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-danger' : 'border-border'}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
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
