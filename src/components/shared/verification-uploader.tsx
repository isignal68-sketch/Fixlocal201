'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { submitVerificationDocumentAction } from '@/lib/actions/verification';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const DOCUMENT_TYPES = [
  { value: 'business_license', label: 'Business license' },
  { value: 'trade_license', label: 'Trade license' },
  { value: 'liability_insurance', label: 'Liability insurance' },
  { value: 'identity', label: 'Government ID' },
];

export function VerificationUploader({ providerId }: { providerId: string }) {
  const router = useRouter();
  const [documentType, setDocumentType] = React.useState('business_license');
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const supabase = createClient();
    const extension = file.name.split('.').pop();
    const path = `${providerId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(path, file, { upsert: false });

    if (uploadError) {
      toast.error(uploadError.message || 'Upload failed');
      setIsUploading(false);
      return;
    }

    const result = await submitVerificationDocumentAction(documentType, path);
    setIsUploading(false);

    if (!result.success) {
      toast.error(result.message ?? 'Could not submit document.');
      return;
    }

    toast.success('Document submitted for review');
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={documentType} onValueChange={setDocumentType}>
        <SelectTrigger className="sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DOCUMENT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button asChild variant="outline" disabled={isUploading}>
        <label className="cursor-pointer">
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {isUploading ? 'Uploading...' : 'Upload document'}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </Button>
    </div>
  );
}
