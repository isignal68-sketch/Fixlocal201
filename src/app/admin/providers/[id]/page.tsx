import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AdminProviderActions } from '@/components/shared/admin-provider-actions';
import { VerificationDocumentActions } from '@/components/shared/verification-document-actions';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { ProviderRow, VerificationRow } from '@/types/database';

export const metadata: Metadata = { title: 'Provider detail' };

interface AdminProviderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProviderDetailPage({ params }: AdminProviderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: provider } = await supabase.from('providers').select('*').eq('id', id).single();
  if (!provider) notFound();

  const { data: verificationsData } = await supabase
    .from('verifications')
    .select('*')
    .eq('provider_id', id)
    .order('created_at', { ascending: false });

  const verifications = (verificationsData as VerificationRow[]) ?? [];

  const docsWithLinks = await Promise.all(
    verifications.map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(doc.document_url, 60 * 10);
      return { ...doc, signedUrl: signed?.signedUrl ?? null };
    })
  );

  const providerRow = provider as ProviderRow;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-semibold">{providerRow.business_name}</h1>
            <StatusBadge status={providerRow.verification_status} />
          </div>
          <Link
            href={`/providers/${providerRow.slug}`}
            target="_blank"
            className="mt-1 inline-block text-sm text-primary hover:underline"
          >
            View public profile →
          </Link>
        </div>
        <AdminProviderActions provider={providerRow} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">License number</span>
            <span>{providerRow.license_number ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Insurance provider</span>
            <span>{providerRow.insurance_provider ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Years in business</span>
            <span>{providerRow.years_in_business ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>{formatDate(providerRow.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification documents</CardTitle>
        </CardHeader>
        <CardContent>
          {docsWithLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {docsWithLinks.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">Submitted {formatDate(doc.created_at)}</p>
                    {doc.signedUrl && (
                      <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        View document
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status} />
                    {doc.status === 'pending' && <VerificationDocumentActions verificationId={doc.id} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
