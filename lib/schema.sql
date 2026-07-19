-- Supabase (Postgres) schema for personal-tracker.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
--
-- Supabase only ever holds the account/onboarding row per user. Tasks, goals,
-- water, and sleep entries live entirely in each user's browser (IndexedDB,
-- see lib/local/) and are never sent to this database — the only place they
-- can end up outside the device is a backup the user explicitly triggers to
-- their own Google Drive (see lib/googleDrive.js).

create table if not exists personal_tracker_users (
  id bigint generated always as identity primary key,
  phone text not null unique,
  name text,
  birth_date date,
  gender text,
  job_type text,
  lifestyle text,
  wake_time time,
  focus_area text,
  health_notes text,
  self_review text,
  best_thing text,
  reminder_opt_in boolean not null default true,
  onboarding_completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS enabled with no permissive policies, as a defense-in-depth backstop: the
-- app only ever talks to this table server-side via SUPABASE_SERVICE_ROLE_KEY
-- (which bypasses RLS by design), so even if the public/anon key ever leaked,
-- PostgREST would refuse every request against this table.
alter table personal_tracker_users enable row level security;

-- Migration for a table created before the age -> birth_date change: run
-- this once against your existing Supabase project instead of the
-- create table above (which no-ops since the table already exists).
-- alter table personal_tracker_users add column if not exists birth_date date;
-- alter table personal_tracker_users drop column if exists age;
