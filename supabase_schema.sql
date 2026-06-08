-- ============================================
-- forge/ — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text,
  location text,
  bio text,
  stack text[] default '{}',
  disciplines text[] default '{}',
  availability text[] default '{}',
  github text,
  devpost text,
  level integer default 1,
  points integer default 0,
  avatar_initials text,
  created_at timestamp with time zone default now()
);

-- Projects table (user's own builds)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  status text default 'completed', -- 'in progress' | 'completed' | 'archived'
  github_url text,
  url text,
  stack text[] default '{}',
  tier integer default 0,
  verified boolean default false,
  points_awarded integer default 0,
  created_at timestamp with time zone default now()
);

-- User hackathons table (personal hackathon history)
create table public.user_hackathons (
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

-- Matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.profiles(id) on delete cascade,
  user_b uuid references public.profiles(id) on delete cascade,
  status text default 'pending', -- 'pending' | 'matched' | 'rejected'
  created_at timestamp with time zone default now(),
  unique(user_a, user_b)
);

-- Hackathons table (public listings)
create table public.hackathons (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.profiles(id),
  name text not null,
  org text,
  description text,
  prize text,
  date_start date,
  date_end date,
  location text,
  is_remote boolean default false,
  tags text[] default '{}',
  disciplines text[] default '{}',
  total_spots integer,
  filled_spots integer default 0,
  created_at timestamp with time zone default now()
);

-- Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.user_hackathons enable row level security;
alter table public.matches enable row level security;
alter table public.hackathons enable row level security;
alter table public.messages enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Projects: anyone can read, only owner can write
create policy "projects_select" on public.projects for select using (true);
create policy "projects_insert" on public.projects for insert with check (auth.uid() = user_id);
create policy "projects_update" on public.projects for update using (auth.uid() = user_id);
create policy "projects_delete" on public.projects for delete using (auth.uid() = user_id);

-- User hackathons: anyone can read, only owner can write
create policy "user_hackathons_select" on public.user_hackathons for select using (true);
create policy "user_hackathons_insert" on public.user_hackathons for insert with check (auth.uid() = user_id);
create policy "user_hackathons_update" on public.user_hackathons for update using (auth.uid() = user_id);
create policy "user_hackathons_delete" on public.user_hackathons for delete using (auth.uid() = user_id);

-- Matches: only involved users can see their matches
create policy "matches_select" on public.matches for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "matches_insert" on public.matches for insert with check (auth.uid() = user_a);

-- Hackathons: anyone can read, authenticated users can create
create policy "hackathons_select" on public.hackathons for select using (true);
create policy "hackathons_insert" on public.hackathons for insert with check (auth.uid() = host_id);

-- Messages: only sender and receiver can see
create policy "messages_select" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages_insert" on public.messages for insert
  with check (auth.uid() = sender_id);

-- Enable Realtime for messages
alter publication supabase_realtime add table public.messages;
