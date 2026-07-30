'use client';

import * as React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  bucket: string;
  pathPrefix: string;
  onUploaded: (url: string) => void | Promise<void>;
  className?: string;
  label?: string;
  accept?: string;
}

export function ImageUploader({
  bucket,
  pathPrefix,
  onUploaded,
  className,
  label = 'Upload image',
  accept = 'image/png,image/jpeg,image/webp',
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB.');
      return;
    }

    setIsUploading(true);
    const supabase = createClient();
    const extension = file.name.split('.').pop();
    const fileName = `${pathPrefix}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      toast.error(error.message || 'Upload failed');
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    await onUploaded(publicUrlData.publicUrl);

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground',
        isUploading && 'pointer-events-none opacity-60',
        className
      )}
    >
      {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
      {isUploading ? 'Uploading...' : label}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
}
