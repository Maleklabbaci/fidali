# 🎯 Fidali — Supabase Setup Guide

## ✅ Your Credentials

```
URL: https://nairumgspwqdgrufjedg.supabase.co
Anon Key: sb_publishable_yvFfhF79lPEGUUcYe9-hVg_WJjNetX_
```

These are already configured in `.env.local`.

---

## 🚀 Step-by-Step Setup

### Step 1: Run the Database Schema

1. Go to **Supabase Dashboard** → [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `nairumgspwqdgrufjedg`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the ENTIRE contents of `database/schema.sql`
6. Paste it in the editor
7. Click **Run** (or Ctrl+Enter)
8. Wait ~10 seconds for completion

### Step 2: Enable Realtime

1. Still in **SQL Editor**
2. Open a new query
3. Copy the contents of `database/enable-realtime.sql`
4. Run it

**OR manually:**
1. Go to **Database** → **Replication** in dashboard
2. Enable realtime for:
   - ✅ `pending_presences`
   - ✅ `client_cards`
   - ✅ `notifications`

### Step 3: Verify Setup

1. In **SQL Editor**, run `database/verify-setup.sql`
2. Check that all tables, views, and functions are created
3. Check that demo data is present

### Step 4: Get Service Role Key

1. Go to **Settings** → **API**
2. Copy the **Service Role Key** (secret)
3. Add it to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```

### Step 5: Configure Auth (Optional)

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Disable email confirmation for testing (re-enable for production)
4. Set redirect URL to your app URL

---

## 📊 Verify Tables in Dashboard

Go to **Table Editor** and confirm these exist:

| ✅ | Table | Rows (demo) |
|----|-------|-------------|
| ☐ | admins | 1 |
| ☐ | merchants | 2 |
| ☐ | loyalty_cards | 2 |
| ☐ | clients | 5 |
| ☐ | client_cards | 8 |
| ☐ | activities | 10 |
| ☐ | pending_presences | 0 |
| ☐ | payment_requests | 0 |
| ☐ | notifications | 0 |
| ☐ | saved_cards | 0 |
| ☐ | platform_settings | 7 |
| ☐ | audit_log | 0 |

---

## 🧪 Test in SQL Editor

```sql
-- Test merchant login
SELECT id, email, business_name, plan, status 
FROM merchants 
WHERE email = 'karim@pizzaoran.dz';

-- Test card lookup
SELECT * FROM loyalty_cards WHERE code = 'PIZZAORAN-A001';

-- Test client joining
SELECT join_card('PIZZAORAN-A001', 'Test User', '0555999999');

-- Test presence validation
SELECT validate_presence(
  (SELECT id FROM client_cards LIMIT 1),
  10,
  '11111111-1111-1111-1111-111111111111'
);

-- Test platform overview
SELECT * FROM platform_overview;

-- Test merchant dashboard
SELECT get_merchant_dashboard('11111111-1111-1111-1111-111111111111');
```

---

## 🔒 Security Checklist

- [ ] Change admin password from `admin123`
- [ ] Enable email confirmation in Auth settings
- [ ] Review RLS policies before production
- [ ] Set up database backups
- [ ] Add rate limiting via Supabase Edge Functions
- [ ] Never expose Service Role Key in client code

---

## 📱 Demo Accounts (after running schema.sql)

| Role | Email | Password |
|------|-------|----------|
| 🍕 Merchant | `karim@pizzaoran.dz` | `demo123` |
| 💇 Merchant | `amina@salonbeaute.dz` | `demo123` |
| 🛡️ Admin | `admin@fidali.dz` | `admin123` |

---

## 🔗 Files Reference

| File | Purpose |
|------|---------|
| `.env.local` | Supabase credentials |
| `lib/supabase.ts` | Supabase client + all API functions |
| `database/schema.sql` | Complete database schema (run first) |
| `database/enable-realtime.sql` | Enable realtime subscriptions |
| `database/verify-setup.sql` | Verify everything works |
| `database/supabase-types.ts` | TypeScript types for all tables |
| `database/supabase-client.ts` | Alternative client helper |
| `database/README.md` | Schema documentation |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install @supabase/supabase-js

# 2. Run schema in Supabase SQL Editor
# (copy database/schema.sql → paste → run)

# 3. Start your app
npm run dev

# 4. Test
# Open http://localhost:3000
# Login: karim@pizzaoran.dz / demo123
```

---

## 🔄 Switching from localStorage to Supabase

The current `index.html` uses localStorage. To switch to Supabase:

1. Replace `localStorage` calls with `supabase` calls from `lib/supabase.ts`
2. Replace `DB.merchants.find()` with `getMerchantProfile()`
3. Replace `DB.cards.filter()` with `getMyCards()`
4. Replace `DB.clientCards` operations with `getClientsByCardId()`
5. Replace polling with `subscribeToPendingPresences()` realtime
6. Replace manual point adding with `validatePresence()` function

The `lib/supabase.ts` file has ALL the functions ready — just swap them in!
