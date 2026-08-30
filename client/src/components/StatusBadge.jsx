export default function StatusBadge({ active, activeLabel, inactiveLabel }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
        ${active ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-success' : 'bg-danger'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
