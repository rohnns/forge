-- ============================================================
-- forge/ — Security Patch
-- Run this in Supabase SQL Editor AFTER the main schema
-- ============================================================

-- ============================================================
-- 1. FIX: profiles — block users from elevating their own level/points
-- ============================================================
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Users cannot update their own level or points (admin only)
    -- These must be updated via service role key only
  );

-- Prevent users from updating level/points via a trigger
CREATE OR REPLACE FUNCTION prevent_score_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  -- If user is trying to change their own level or points, block it
  IF NEW.level != OLD.level OR NEW.points != OLD.points THEN
    IF auth.uid() = NEW.id THEN
      RAISE EXCEPTION 'Cannot manually update level or points';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_score_manipulation_trigger ON public.profiles;
CREATE TRIGGER prevent_score_manipulation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_score_manipulation();

-- ============================================================
-- 2. FIX: matches — prevent duplicate swipes and self-matching
-- ============================================================
DROP POLICY IF EXISTS "matches_insert" ON public.matches;

CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (
    auth.uid() = user_a           -- can only create matches as yourself
    AND user_a != user_b          -- can't match with yourself
    AND auth.uid() != user_b      -- redundant but explicit
  );

-- Prevent updating match status from client side
DROP POLICY IF EXISTS "matches_update" ON public.matches;
-- No update policy = clients cannot change match status (only service role can)

-- ============================================================
-- 3. FIX: messages — add content length limit and block non-connections
-- ============================================================
DROP POLICY IF EXISTS "messages_insert" ON public.messages;

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND sender_id != receiver_id                    -- can't message yourself
    AND length(content) > 0                         -- no empty messages
    AND length(content) <= 2000                     -- max 2000 chars
    AND (
      -- Must have a match record in either direction
      EXISTS (
        SELECT 1 FROM public.matches
        WHERE (user_a = auth.uid() AND user_b = receiver_id)
           OR (user_a = receiver_id AND user_b = auth.uid())
      )
    )
  );

-- ============================================================
-- 4. FIX: projects — prevent tier/points manipulation
-- ============================================================
DROP POLICY IF EXISTS "projects_update" ON public.projects;

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Block clients from setting verified=true or changing tier/points
CREATE OR REPLACE FUNCTION prevent_project_score_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  -- Clients cannot verify their own projects or change tier/points
  IF NEW.verified = true AND OLD.verified = false THEN
    RAISE EXCEPTION 'Cannot self-verify projects';
  END IF;
  IF NEW.tier != OLD.tier AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot manually change project tier';
  END IF;
  IF NEW.points_awarded != OLD.points_awarded AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot manually change points';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_project_score_manipulation_trigger ON public.projects;
CREATE TRIGGER prevent_project_score_manipulation_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION prevent_project_score_manipulation();

-- ============================================================
-- 5. FIX: profiles — add field length constraints
-- ============================================================
ALTER TABLE public.profiles
  ADD CONSTRAINT bio_length CHECK (length(bio) <= 500),
  ADD CONSTRAINT name_length CHECK (length(name) <= 100),
  ADD CONSTRAINT location_length CHECK (length(location) <= 100),
  ADD CONSTRAINT github_length CHECK (length(github) <= 200),
  ADD CONSTRAINT devpost_length CHECK (length(devpost) <= 200);

-- ============================================================
-- 6. FIX: messages — add content constraints at DB level
-- ============================================================
ALTER TABLE public.messages
  ADD CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0),
  ADD CONSTRAINT content_max_length CHECK (length(content) <= 2000);

-- ============================================================
-- 7. FIX: projects — add field constraints
-- ============================================================
ALTER TABLE public.projects
  ADD CONSTRAINT project_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT project_desc_length CHECK (length(description) <= 1000),
  ADD CONSTRAINT valid_tier CHECK (tier >= 0 AND tier <= 3),
  ADD CONSTRAINT valid_points CHECK (points_awarded >= 0 AND points_awarded <= 3);

-- ============================================================
-- 8. FIX: rate limit swipe inserts at DB level
-- ============================================================
CREATE OR REPLACE FUNCTION check_swipe_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.matches
  WHERE user_a = NEW.user_a
    AND created_at > NOW() - INTERVAL '1 hour';

  IF recent_count >= 500 THEN
    RAISE EXCEPTION 'Too many swipes in the last hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS swipe_rate_limit_trigger ON public.matches;
CREATE TRIGGER swipe_rate_limit_trigger
  BEFORE INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION check_swipe_rate_limit();

-- ============================================================
-- 9. FIX: message rate limiting at DB level
-- ============================================================
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'Too many messages. Slow down.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS message_rate_limit_trigger ON public.messages;
CREATE TRIGGER message_rate_limit_trigger
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION check_message_rate_limit();

-- ============================================================
-- 10. FIX: add updated_at tracking for audit trail
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
