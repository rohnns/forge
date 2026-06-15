-- FIX #9: profiles_update policy WITH CHECK clause did not enforce that
-- users cannot change their own `level` or `points` columns. The original
-- patch relied solely on a trigger — but triggers can be dropped or bypassed
-- via the service role. This policy enforces it at the auth layer too.

DROP POLICY IF EXISTS profiles_update ON profiles;

CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
    AND level = (SELECT level FROM profiles WHERE user_id = auth.uid())
    AND points = (SELECT points FROM profiles WHERE user_id = auth.uid())
  );
