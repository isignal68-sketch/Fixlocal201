-- =============================================================================
-- Migration 00010: Storage Buckets
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('provider-logos', 'provider-logos', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('provider-covers', 'provider-covers', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('provider-gallery', 'provider-gallery', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('review-photos', 'review-photos', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('message-images', 'message-images', true, 10485760, array['image/png','image/jpeg','image/webp']),
  ('verification-documents', 'verification-documents', false, 10485760, array['image/png','image/jpeg','application/pdf']),
  ('invoices', 'invoices', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- Avatars: users manage their own folder (path prefix = user id)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Provider logos / covers / gallery: public read, owning provider can write
create policy "Provider media is publicly accessible"
  on storage.objects for select
  using (bucket_id in ('provider-logos', 'provider-covers', 'provider-gallery'));

create policy "Providers can upload their own media"
  on storage.objects for insert
  with check (
    bucket_id in ('provider-logos', 'provider-covers', 'provider-gallery')
    and public.owns_provider(((storage.foldername(name))[1])::uuid)
  );

create policy "Providers can update their own media"
  on storage.objects for update
  using (
    bucket_id in ('provider-logos', 'provider-covers', 'provider-gallery')
    and public.owns_provider(((storage.foldername(name))[1])::uuid)
  );

create policy "Providers can delete their own media"
  on storage.objects for delete
  using (
    bucket_id in ('provider-logos', 'provider-covers', 'provider-gallery')
    and public.owns_provider(((storage.foldername(name))[1])::uuid)
  );

-- Review photos: public read, uploading customer can write to their own folder
create policy "Review photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'review-photos');

create policy "Customers can upload their own review photos"
  on storage.objects for insert
  with check (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Message images: only conversation participants can read/write
create policy "Conversation participants can view message images"
  on storage.objects for select
  using (
    bucket_id = 'message-images'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.customer_id = auth.uid() or public.owns_provider(c.provider_id))
    )
  );

create policy "Conversation participants can upload message images"
  on storage.objects for insert
  with check (
    bucket_id = 'message-images'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.customer_id = auth.uid() or public.owns_provider(c.provider_id))
    )
  );

-- Verification documents: private, only owning provider and admins
create policy "Providers can view their own verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and (
      public.owns_provider(((storage.foldername(name))[1])::uuid)
      or public.is_admin()
    )
  );

create policy "Providers can upload their own verification documents"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and public.owns_provider(((storage.foldername(name))[1])::uuid)
  );

-- Invoices: private, only booking participants and admins (enforced via signed URLs
-- generated server-side; default deny for direct client access)
create policy "No direct client access to invoices"
  on storage.objects for select
  using (bucket_id = 'invoices' and public.is_admin());
