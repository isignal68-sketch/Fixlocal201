'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function FavoriteButton({
  providerId,
  userId,
  initialFavorited,
}: {
  providerId: string;
  userId: string | null;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = React.useState(initialFavorited);
  const [isPending, setIsPending] = React.useState(false);

  async function toggleFavorite() {
    if (!userId) {
      router.push('/login');
      return;
    }

    setIsPending(true);
    const supabase = createClient();

    if (isFavorited) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('provider_id', providerId);
      setIsFavorited(false);
      toast.success('Removed from favorites');
    } else {
      await supabase.from('favorites').insert({ user_id: userId, provider_id: providerId });
      setIsFavorited(true);
      toast.success('Saved to favorites');
    }

    setIsPending(false);
  }

  return (
    <Button variant="outline" onClick={toggleFavorite} disabled={isPending} aria-pressed={isFavorited}>
      <Heart className={cn('size-4', isFavorited && 'fill-destructive text-destructive')} />
      {isFavorited ? 'Saved' : 'Save'}
    </Button>
  );
}
