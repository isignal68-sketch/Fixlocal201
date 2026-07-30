'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { deleteCategoryAction } from '@/lib/actions/admin-content';
import { Button } from '@/components/ui/button';

export function DeleteCategoryButton({ categoryId, name }: { categoryId: string; name: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  async function handleDelete() {
    if (!confirm(`Delete category "${name}"? Services in this category will be affected.`)) return;
    setIsPending(true);
    const result = await deleteCategoryAction(categoryId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not delete category.');
      return;
    }
    toast.success('Category deleted');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
