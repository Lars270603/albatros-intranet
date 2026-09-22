-- Albatros Intranet — Update v9: Serientermine im Firmenkalender, einstellbare
-- Stimmenanzahl pro Person bei Umfragen.
-- In Supabase SQL Editor ausführen, bevor die neuen Features genutzt werden.
-- Idempotent — kann gefahrlos mehrfach ausgeführt werden.

alter table calendar_events add column if not exists event_time time;
alter table calendar_events add column if not exists recurrence text not null default 'none'
  check (recurrence in ('none','weekly','biweekly','monthly'));
alter table calendar_events add column if not exists recurrence_end_date date;

alter table polls add column if not exists max_choices integer not null default 1;

-- Bestehende Mehrfachauswahl-Umfragen (aus dem vorherigen Update) hätten durch
-- den neuen Default (max_choices = 1) sonst plötzlich nur noch eine Stimme pro
-- Person erlaubt. Für sie das Limit auf die Anzahl ihrer Optionen setzen, damit
-- sich am bisherigen Verhalten (beliebig viele der vorhandenen Optionen wählbar)
-- nichts ändert.
update polls
set max_choices = greatest(jsonb_array_length(options), 2)
where multiple_choice = true and max_choices = 1;
