-- IMPORTANT: Run this SQL in your Supabase project's SQL Editor to fix the admin action permissions
-- This fixes the RLS policies that were using profiles.id instead of profiles.user_id

-- 1. Drop the old incorrect policies (they reference profiles.id which doesn't match auth.uid())
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Admins can view activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admins can create activity logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 2. Recreate the policies with the CORRECT column reference (user_id instead of id)

-- Reports table policies
CREATE POLICY "Admins can view all reports" ON reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update reports" ON reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Activity logs policies
CREATE POLICY "Admins can view activity logs" ON admin_activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can create activity logs" ON admin_activity_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Profiles table policies
CREATE POLICY "Users can view active profiles" ON profiles
FOR SELECT
USING (
  banned = false
  OR auth.uid() = user_id
);

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.is_admin = true
  )
);

CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.is_admin = true
  )
);
