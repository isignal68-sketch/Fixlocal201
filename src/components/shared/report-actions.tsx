'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { resolveReportAction } from '@/lib/actions/admin-moderation';
import { Button } from '@/components/ui/button';

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handle(status: 'resolved' | 'dismissed') {
    setIsPending(true);
    const result = await resolveReportAction(reportId, status);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not update report.');
      return;
    }
    toast.success(status === 'resolved' ? 'Report resolved' : 'Report dismissed');
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handle('resolved')} disabled={isPending}>
        Resolve
      </Button>
      <Button size="sm" variant="outline" onClick={() => handle('dismissed')} disabled={isPending}>
        Dismiss
      </Button>
    </div>
  );
}
