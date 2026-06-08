-- Migration: Add user_hackathons table and update projects table
-- Run this if you already have the base schema set up

-- Add url + stack columns to projects if missing
alter table public.projects add column if not exists url text;
alter table public.projects add column if not exists stack text[] default '{}';
alter table public.projects add column if not exists status text default 'completed';

-- Create user_hackathons table for personal hackathon history
create table if not exists public.user_hackathons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  event_name text,
  description text,
  url text,
  stack text[] default '{}',
  placement integer,
  team_size integer,
  date date,
  created_at timestamp with time zone default now()
);

alter table public.user_hackathons enable row level security;

create policy "user_hackathons_select" on public.user_hackathons for select using (true);
create policy "user_hackathons_insert" on public.user_hackathons for insert with check (auth.uid() = user_id);
create policy "user_hackathons_update" on public.user_hackathons for update using (auth.uid() = user_id);
create policy "user_hackathons_delete" on public.user_hackathons for delete using (auth.uid() = user_id);
