import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getProviderForUser } from '@/lib/data/provider-dashboard';
import { createClient } from '@/lib/supabase/server';
import { VerificationUploader } from '@/components/shared/verification-uploader';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';
import type { VerificationRow } from '@/types/database';

export const metadata: Metadata = { title: 'Verification' };

export default async function ProviderVerificationPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const provider = await getProviderForUser(user.id);
  if (!provider) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('verifications')
    .select('*')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false });

  const verifications = (data as VerificationRow[]) ?? [];

  const docsWithLinks = await Promise.all(
    verifications.map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(doc.document_url, 60 * 10);
      return { ...doc, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold">Verification</h2>
        <StatusBadge status={provider.verification_status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit your license and insurance documents for review. Verified providers get a badge
        and rank higher in search.
      </p>

      <div className="mt-6">
        <VerificationUploader providerId={provider.id} />
      </div>

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border">
        {docsWithLinks.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No documents submitted yet.</p>
        ) : (
          docsWithLinks.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium capitalize">
                  {doc.document_type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(doc.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={doc.status} />
                {doc.signedUrl && (
                  <a
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
