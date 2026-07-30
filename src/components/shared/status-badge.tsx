import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  declined: 'bg-red-100 text-red-800',
  verified: 'bg-emerald-100 text-emerald-800',
  unverified: 'bg-slate-100 text-slate-700',
  rejected: 'bg-red-100 text-red-800',
  open: 'bg-blue-100 text-blue-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-red-100 text-red-800',
  past_due: 'bg-amber-100 text-amber-800',
  canceled: 'bg-red-100 text-red-800',
  trialing: 'bg-blue-100 text-blue-800',
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
  dismissed: 'bg-slate-100 text-slate-700',
  reviewing: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-amber-100 text-amber-800',
  exhausted: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  in_progress: 'In progress',
  past_due: 'Past due',
};

export function StatusBadge({ status }: { status: string }) {
  const label = statusLabels[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        statusStyles[status] ?? 'bg-slate-100 text-slate-700'
      )}
    >
      {label}
    </span>
  );
}
