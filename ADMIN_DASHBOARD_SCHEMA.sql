-- Admin Dashboard Schema Migration
-- This file documents the SQL migrations needed for the admin dashboard feature
-- Run these commands in your Supabase project (SQL Editor)

-- 1. Add admin fields to profiles table
ALTER TABLE profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN banned BOOLEAN DEFAULT FALSE,
ADD COLUMN ban_reason TEXT,
ADD COLUMN ban_duration TEXT,
ADD COLUMN ban_date TIMESTAMPTZ,
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- 2. Create reports table for tracking reported profiles
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  reported_by_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  action_taken TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by_admin_id UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('ban_user', 'unban_user', 'verify_user', 'dismiss_report', 'view_profile')),
  target_user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(banned);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target ON admin_activity_logs(target_user_id);

-- 5. Enable RLS (Row Level Security) on new tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for admin access
-- Policy: Only admins can view reports
CREATE POLICY "Admins can view all reports" ON reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Only admins can update reports
CREATE POLICY "Admins can update reports" ON reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Users can report profiles
CREATE POLICY "Users can create reports" ON reports
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Policy: Only admins can view activity logs
CREATE POLICY "Admins can view activity logs" ON admin_activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Policy: Admins can insert activity logs
CREATE POLICY "Admins can create activity logs" ON admin_activity_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 7. Update profiles table RLS policies to include admin-specific queries
-- Policy: Users can read non-banned profiles
CREATE POLICY "Users can view active profiles" ON profiles
FOR SELECT
USING (
  banned = false
  OR auth.uid() = id
);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);

-- Policy: Admins can update profiles
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.is_admin = true
  )
);

-- Note: Manually add at least one admin user by running:
-- UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';
