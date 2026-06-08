-- Run this in Supabase SQL Editor

-- Add photo_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Add photo_url to projects (for hardware proof)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS photo_url text;

-- Add devpost_url to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS devpost_url text;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to avatars bucket
CREATE POLICY "avatar_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatar_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatar_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
