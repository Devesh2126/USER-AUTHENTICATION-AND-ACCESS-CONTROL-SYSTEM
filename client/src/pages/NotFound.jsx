import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs text-muted mb-2">ERROR 404</p>
      <h1 className="font-display font-semibold text-2xl mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-accent text-sm font-medium hover:underline">Back to home</Link>
    </div>
  );
}
