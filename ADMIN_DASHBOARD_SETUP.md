# Admin Dashboard Setup Guide

## Overview
This guide explains how to set up and use the new Admin Dashboard feature for the Buscando Amor Eterno dating app. The dashboard allows administrators to:

- Monitor all registered users
- Spot and manage suspicious/fake profiles
- Ban users and set ban durations
- Verify legitimate user profiles
- Review reported profiles and manage reports
- Track admin activities

## Prerequisites

- Access to your Supabase project
- Administrator account with proper permissions
- Basic familiarity with Supabase SQL editor

## Step 1: Apply Database Migrations

The Admin Dashboard requires several new tables and fields in your Supabase database.

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project
2. Navigate to **SQL Editor** in the sidebar
3. Click **New Query** to create a new SQL query
4. Copy all the SQL from the file: `ADMIN_DASHBOARD_SCHEMA.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute all migrations

### What Gets Created:

**New Columns in `profiles` table:**
- `is_admin` (BOOLEAN) - Marks users as administrators
- `banned` (BOOLEAN) - Tracks if user is banned
- `ban_reason` (TEXT) - Reason for banning the user
- `ban_duration` (TEXT) - Duration of ban (permanent, 7d, 30d)
- `ban_date` (TIMESTAMP) - When the user was banned
- `verified` (BOOLEAN) - Marks profiles as verified by admin

**New Tables:**
- `reports` - Stores user-reported profiles
- `admin_activity_logs` - Tracks all admin actions (bans, verifications, etc.)

**New Indexes:**
- Performance indexes on `is_admin`, `banned`, `status`, and timestamp columns

**RLS Policies:**
- Admin-only read/write policies for reports and activity logs
- User ability to create reports
- Admin read/update permissions for profiles

## Step 2: Make Your User an Administrator

After applying migrations, you need to grant admin privileges to your user account:

1. Go to your Supabase project
2. Navigate to the **SQL Editor**
3. Create a new query with this command (replace `YOUR_USER_ID` with your actual user ID):

```sql
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID';
```

**How to find your User ID:**
- Sign in to your account
- Open browser Developer Tools (F12)
- Go to **Application** → **Local Storage**
- Search for the Supabase session token
- Or check the `users` table in Supabase directly

## Step 3: Verify Installation

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Sign in to your account

3. Navigate to `http://localhost:3000/admin` in your browser

4. You should see the Admin Dashboard with:
   - Dashboard Overview with stats cards
   - Users Management tab
   - Reports tab
   - Activity Log tab

If you see "Access Denied", double-check that:
- The migration was applied successfully
- Your user ID was updated with `is_admin = true`
- The page refreshes after making changes

## Dashboard Features

### 1. Dashboard Overview (Stats Cards)
Shows real-time statistics:
- **Total Users** - All registered users
- **New Today** - Users who signed up today
- **Active Chats** - Messages sent today
- **Total Calls** - Total number of calls made
- **Reported Profiles** - Pending user reports
- **Banned Users** - Total banned users

Stats refresh every 30 seconds.

### 2. Users Management Tab

#### Search & Filter
- Search users by name, email, or user ID
- Results update in real-time

#### User Table Columns
- **Photo** - Profile thumbnail
- **Name** - User's display name
- **Email** - User's email address
- **Join Date** - When user registered
- **Status** - Active or Banned
- **Action** - View detailed profile

#### User Detail Modal
When you click "View" on a user:
- See all profile photos
- View profile information (name, email, location, bio)
- Read profile responses (prompts)
- View ban status (if banned)
- Take admin actions:
  - **Verify User** - Mark as verified (shows badge in app)
  - **Ban User** - Ban with custom reason and duration

### 3. Reports Tab

#### Report Management
- View all user reports in one place
- See who reported whom and why
- Columns show:
  - Reported user name
  - Who made the report
  - Reason for report
  - When it was reported
  - Current status

#### Actions on Reports
- **View Profile** - Opens the reported user's detailed profile
- **Dismiss Report** - Mark report as dismissed
- **Ban User** - (via the profile modal) Ban the reported user with reason/duration

### 4. Activity Log Tab

#### Track Admin Actions
- Filter by action type:
  - Banned User
  - Unbanned User
  - Verified User
  - Dismissed Report
  - Viewed Profile

#### Detailed Logs Show
- Which admin took the action
- Target user (if applicable)
- When the action occurred
- Additional details (reason, duration, etc.)
- Last 50 actions displayed

## Common Admin Tasks

### How to Ban a User

1. Go to **Users** tab
2. Search for the user (by name, email, or ID)
3. Click **View** to open their profile
4. Click **Ban User** button
5. Select ban duration:
   - Permanent
   - 7 Days
   - 30 Days
6. Enter the reason (e.g., "Fake profile", "Harassment", "Inappropriate content")
7. Click **Confirm Ban**
8. The user will be marked as banned and unable to access the app

### How to Verify a User

1. Go to **Users** tab
2. Find the user and click **View**
3. Click **Verify User** button
4. The user will get a "Verified" badge on their profile
5. This helps other users trust the account

### How to Review a Report

1. Go to **Reports** tab
2. See the list of pending reports
3. Click the **eye icon** to view the reported user's profile
4. Review their photos, bio, and activity
5. Either:
   - Click **Ban User** if profile violates policies
   - Click **Dismiss Report** if it's a false report
6. All actions are logged in the Activity Log

## Security Considerations

### Row Level Security (RLS)
The Admin Dashboard uses Supabase RLS policies to ensure:
- Only admins can access admin tools
- Regular users cannot view other user reports/bans
- All admin actions are logged and auditable

### Access Control
- Admin pages require `is_admin = true` in the profiles table
- Non-admin users are redirected to `/login`
- If someone tries to access `/admin` without admin privileges, they see "Access Denied"

### Activity Tracking
- Every admin action is logged in `admin_activity_logs` table
- Includes: who did it, what action, when, and details
- Helps audit admin behavior and prevent abuse

## Troubleshooting

### "Access Denied" When Visiting /admin

**Problem:** You're seeing the Access Denied message even though you should be an admin.

**Solutions:**
1. Verify your user ID is correctly updated:
   ```sql
   SELECT user_id, is_admin FROM profiles WHERE is_admin = true;
   ```
2. Try logging out and back in to refresh the session
3. Check browser localStorage is enabled
4. Clear browser cache and reload

### Stats Card Shows 0 Users

**Problem:** The dashboard shows 0 users but you know users exist.

**Solutions:**
1. Check that the RLS policy "Admins can view all profiles" is enabled
2. Verify the migration was fully applied
3. Refresh the page
4. Check the browser console for errors (F12)

### Can't View User Details

**Problem:** Clicking "View" on a user doesn't open the modal.

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify network requests in Network tab (should see calls to `/profiles`)
3. Ensure `user_id` column exists in the profiles table

### Ban/Verify Actions Not Working

**Problem:** When you click "Ban User" or "Verify User", nothing happens.

**Solutions:**
1. Check that you have RLS permissions to update profiles
2. Run this SQL to verify your admin status:
   ```sql
   SELECT is_admin FROM profiles WHERE user_id = 'YOUR_USER_ID';
   ```
3. Check browser console for error messages
4. Make sure your Supabase service role key is correctly configured

## Advanced: Manual Admin Setup

If you want to set up admin access without using the UI:

1. **Get your User ID:**
   ```sql
   SELECT id, email FROM profiles LIMIT 5;
   ```

2. **Make yourself admin:**
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
   ```

3. **Verify it worked:**
   ```sql
   SELECT display_name, email, is_admin FROM profiles WHERE is_admin = true;
   ```

4. **Create a test report (for testing):**
   ```sql
   INSERT INTO reports (reported_user_id, reported_by_user_id, reason, description)
   VALUES (
     'USER_ID_TO_REPORT',
     'YOUR_USER_ID',
     'Fake profile',
     'Profile photos appear to be stock images'
   );
   ```

## API Endpoints Used

The Admin Dashboard uses the following Supabase queries:

| Feature | Endpoint | Method |
|---------|----------|--------|
| Fetch stats | profiles, messages, call_logs, reports | SELECT COUNT |
| Get users list | profiles | SELECT * |
| Get user details | profiles | SELECT * WHERE user_id |
| Ban user | profiles | UPDATE banned=true |
| Verify user | profiles | UPDATE verified=true |
| Fetch reports | reports | SELECT * |
| Dismiss report | reports | UPDATE status='dismissed' |
| Activity logs | admin_activity_logs | SELECT * |
| Log action | admin_activity_logs | INSERT |

All requests are protected by RLS policies that verify `is_admin = true`.

## Next Steps

1. **Set up backup admin account:**
   - Create another admin user for backup in case of emergency
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'backup-admin@example.com';
   ```

2. **Configure moderation policies:**
   - Decide on ban duration standards
   - Create guidelines for what constitutes a bannable offense

3. **Monitor regularly:**
   - Check the Activity Log weekly
   - Review pending reports daily
   - Keep an eye on new user patterns for spam

4. **Test the system:**
   - Create test accounts
   - Practice banning and unbanning
   - Verify all features work as expected

## Support

If you encounter issues:
1. Check the ADMIN_DASHBOARD_SCHEMA.sql file for the exact migrations
2. Review the Supabase RLS policies
3. Check browser console for JavaScript errors
4. Verify all tables and columns were created with the migrations

## Code Files Reference

### Main Components
- `/app/admin/page.tsx` - Main admin dashboard page
- `/app/admin/layout.tsx` - Admin route layout
- `/components/admin/admin-protected-route.tsx` - Access control wrapper
- `/components/admin/admin-stats-cards.tsx` - Stats display
- `/components/admin/admin-users-table.tsx` - Users list and search
- `/components/admin/admin-user-detail-modal.tsx` - User details and actions
- `/components/admin/ban-user-form.tsx` - Ban form
- `/components/admin/admin-reported-profiles.tsx` - Reports management
- `/components/admin/admin-activity-log.tsx` - Activity log viewer

### Hooks
- `/hooks/useAdmin.ts` - Check if user is admin
- `/hooks/useAdminStats.ts` - Fetch dashboard stats
- `/hooks/useAdminReports.ts` - Manage reports
- `/hooks/useAdminActions.ts` - Ban/verify user actions

### Database
- `ADMIN_DASHBOARD_SCHEMA.sql` - All migrations and RLS policies

---

**Last Updated:** January 2025
**Version:** 1.0
