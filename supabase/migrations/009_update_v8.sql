-- Albatros Intranet — Update v8: "documents"-Storage-Bucket (neu) anlegen/reparieren
-- In Supabase SQL Editor ausführen, um den 404 "Bucket not found" bei
-- News-Anhängen und Leitfaden-Dateianhängen zu beheben.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists "documents_read" on storage.objects;
create policy "documents_read" on storage.objects for select using (bucket_id = 'documents');

drop policy if exists "documents_write" on storage.objects;
create policy "documents_write" on storage.objects for insert with check (bucket_id = 'documents' and auth.uid() is not null);

drop policy if exists "documents_delete" on storage.objects;
create policy "documents_delete" on storage.objects for delete using (bucket_id = 'documents' and auth.uid() is not null);
