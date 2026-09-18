-- Albatros Intranet — Update v7: neue Abteilung "Assistenz d. GF", Mehrfachauswahl-Umfragen
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

alter table profiles drop constraint if exists profiles_department_check;
alter table profiles add constraint profiles_department_check
  check (department is null or department in
    ('vertrieb','einkauf','kundenservice','geschaeftsfuehrung','assistenz_gf'));

alter table polls add column if not exists multiple_choice boolean not null default false;

alter table poll_votes drop constraint if exists poll_votes_poll_id_user_id_key;
alter table poll_votes add constraint poll_votes_poll_id_user_id_option_id_key
  unique (poll_id, user_id, option_id);

-- Stimmen wechseln (Einzelauswahl) und Toggle abwählen (Mehrfachauswahl) löschen jetzt
-- gezielt einzelne poll_votes-Zeilen statt sie per Upsert zu überschreiben — dafür fehlte
-- bisher eine delete-Policy komplett.
drop policy if exists "poll_votes_delete_own" on poll_votes;
create policy "poll_votes_delete_own" on poll_votes for delete using (auth.uid() = user_id);
