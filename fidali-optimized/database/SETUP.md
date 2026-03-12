# 🚀 Fidali Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: `eyJ...`
   - **Service Role Key**: `eyJ...`

## Step 2: Run the Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Paste the entire contents of `schema.sql`
4. Click **Run**
5. Wait for completion (~10 seconds)

## Step 3: Verify Tables

Go to **Table Editor** and confirm these tables exist:
- ✅ admins
- ✅ merchants
- ✅ loyalty_cards
- ✅ clients
- ✅ client_cards
- ✅ activities
- ✅ pending_presences
- ✅ payment_requests
- ✅ notifications
- ✅ saved_cards
- ✅ platform_settings
- ✅ audit_log

## Step 4: Enable Realtime

1. Go to **Database** → **Replication**
2. Enable realtime for:
   - `pending_presences`
   - `client_cards`

## Step 5: Set Environment Variables

Create `.env.local` in your Next.js project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

## Step 6: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 7: Copy Files to Your Project

```
database/supabase-types.ts → types/database.ts
database/supabase-client.ts → lib/supabase.ts
```

## Step 8: Test

```sql
-- Test merchant login
SELECT * FROM merchants WHERE email = 'karim@pizzaoran.dz';

-- Test card lookup
SELECT * FROM loyalty_cards WHERE code = 'PIZZAORAN-A001';

-- Test join card function
SELECT join_card('PIZZAORAN-A001', 'Test Client', '0555000000');

-- Test validate presence
SELECT validate_presence(
  (SELECT id FROM client_cards LIMIT 1),
  10,
  '11111111-1111-1111-1111-111111111111'
);

-- Test dashboard data
SELECT get_merchant_dashboard('11111111-1111-1111-1111-111111111111');

-- Test platform overview
SELECT * FROM platform_overview;
```

## 🔒 Security Notes

1. **Change the admin password** immediately after setup
2. **Enable email confirmation** in Supabase Auth settings
3. **Review RLS policies** before going to production
4. **Set up database backups** in Supabase settings
5. **Monitor usage** in Supabase dashboard

## 📊 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🍕 Merchant | karim@pizzaoran.dz | demo123 |
| 💇 Merchant | amina@salonbeaute.dz | demo123 |
| 🛡️ Admin | admin@fidali.dz | admin123 |
