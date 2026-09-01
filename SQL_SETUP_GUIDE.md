# צועדים - SQL Setup Guide

This guide walks through deploying the complete database schema for צועדים to your Supabase project.

## Prerequisites
- Supabase project created at https://supabase.com
- Supabase URL and API keys configured in `.env.local`
- Access to Supabase SQL Editor

## Schema Deployment Steps

### Step 1: Open Supabase SQL Editor
1. Log in to https://supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Create Core Tables
Copy and paste the entire schema.sql content from `../חומרים לאפליקציית מעקב אישי/schema.sql` into the SQL editor and execute.

This creates:
- `profiles` - User metadata and XP tracking
- `goals` - Goal definitions with flexible JSONB details
- `progress_entries` - Immutable activity log
- `subscriptions` - Stripe integration
- `groups` - Community leaderboard groups
- `group_members` - Many-to-many group participation
- `leaderboard_opt_in` - Privacy control

### Step 3: Enable Row-Level Security (RLS)
Copy and paste the entire rls_policies.sql content from `../חומרים לאפליקציית מעקב אישי/rls_policies.sql` into a new SQL Editor query and execute.

**Critical**: This enables RLS on all tables and creates policies to:
- Prevent unauthorized data access
- Allow only self-service profile updates
- Protect subscription table from client writes (webhook only)
- Enable leaderboard views with opt-in controls

### Step 4: Enable Auth Providers
In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (default)
3. Enable **Google OAuth** (recommended for user experience)
   - Get Google Client ID from Google Cloud Console
   - Add OAuth credentials to Supabase

### Step 5: Verify Setup
Run these test queries in SQL Editor:

```sql
-- Check all tables exist
select table_name from information_schema.tables 
where table_schema = 'public' 
order by table_name;

-- Verify RLS is enabled on all tables
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public' 
order by tablename;
```

Expected output: All 7 tables listed, all with rowsecurity = true

### Step 6: Create Seed Data (for testing)
Run this in SQL Editor with your test user ID (get from Auth tab):

```sql
-- After user signs up, get their UID from Auth
-- Then run this (replace {USER_ID} with actual UUID):

INSERT INTO profiles (id, display_name, avatar_url, total_points)
VALUES ('{USER_ID}', 'Test User', NULL, 0);

-- Create sample goals
INSERT INTO goals (user_id, type, title, category, details, status)
VALUES 
  ('{USER_ID}', 'quantitative', 'Run 50km', 'fitness', '{"start_value": 0, "target_value": 50, "unit": "km"}', 'active'),
  ('{USER_ID}', 'streak', 'Daily Meditation', 'health', '{"frequency": "daily", "target_per_week": 7, "duration_minutes": 10}', 'active'),
  ('{USER_ID}', 'milestone', 'Complete TypeScript Course', 'learning', '{"due_date": "2026-12-31"}', 'active');
```

## Environment Variables
Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get these from Supabase Dashboard → Settings → API

## Stripe Setup (for Subscriptions)
1. Create Stripe account at https://stripe.com
2. Get test API keys
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```
4. Set up webhook endpoint: https://your-app/api/webhooks/stripe

## Next Steps
1. ✅ Schema deployed
2. ✅ RLS policies active
3. ✅ Auth providers configured
4. → Begin component implementation
5. → Wire up Supabase client in Next.js
6. → Test auth flow

## Troubleshooting

**"Permission denied" error when accessing tables**
- Check RLS is enabled: Run step 5 verification
- Check auth.uid() context (user must be logged in)
- Check policies allow the operation

**Can't find tables in Supabase UI**
- Refresh the page
- Check "Include hidden schemas" if using schema other than "public"

**Auth not working**
- Verify email provider is enabled in Auth → Providers
- Check email in confirm email if using email auth
- For OAuth, verify credentials in Auth → Providers

## Documentation
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Postgres JSON Support](https://www.postgresql.org/docs/current/datatype-json.html)
- [Supabase TypeScript Client](https://supabase.com/docs/reference/javascript)
