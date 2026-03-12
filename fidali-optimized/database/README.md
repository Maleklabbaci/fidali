# 🎯 Fidali — Database Schema

## Quick Start

1. Go to your **Supabase Dashboard** → SQL Editor
2. Paste the entire `schema.sql` file
3. Click **Run**
4. Done! All tables, views, functions, triggers, and demo data are created.

---

## 📊 Tables Overview (13 tables)

| # | Table | Description | Rows (demo) |
|---|-------|-------------|-------------|
| 1 | `admins` | Platform administrators | 1 |
| 2 | `merchants` | Commerçants (restaurant, salon, boutique...) | 2 |
| 3 | `loyalty_cards` | Cartes de fidélité créées par les commerçants | 2 |
| 4 | `clients` | Clients (ajoutés via QR scan, PAS de login) | 5 |
| 5 | `client_cards` | Liaison client ↔ carte (points, progression) | 8 |
| 6 | `activities` | Journal de toutes les activités | 10 |
| 7 | `pending_presences` | Présences en attente de validation | 0 |
| 8 | `payment_requests` | Demandes d'upgrade de plan | 0 |
| 9 | `notifications` | Notifications (merchant + client) | 0 |
| 10 | `saved_cards` | Cartes sauvegardées sur les appareils clients | 0 |
| 11 | `platform_settings` | Configuration globale de la plateforme | 7 |
| 12 | `audit_log` | Journal d'audit pour l'admin | 0 |

---

## 🔄 The Flow (in SQL)

### 1. Merchant signs up
```sql
INSERT INTO merchants (email, password_hash, name, business_name, sector, phone)
VALUES ('ali@boutique.dz', crypt('password', gen_salt('bf')), 'Ali', 'Boutique Ali 👗', 'boutique', '0555...');
-- status = 'pending' by default → admin must validate
```

### 2. Admin validates
```sql
UPDATE merchants SET status = 'active', validated_at = NOW() WHERE id = '...';
```

### 3. Merchant creates a card
```sql
INSERT INTO loyalty_cards (merchant_id, business_name, color1, color2, points_rule, points_per_visit, reward, max_points, code)
VALUES ('merchant-uuid', 'Boutique Ali 👗', '#C77DFF', '#E0AAFF', '1 point par achat', 1, '10 achats = -20% 🎁', 10, generate_card_code('Boutique Ali'));
-- Trigger checks plan limits automatically!
```

### 4. Client scans QR and joins
```sql
SELECT join_card('BOUTIQUEALI-A3F2', 'Fatima Zahra', '0555998877');
-- Returns: {success: true, is_new: true, client_card_id: '...', welcome_message: '...'}
```

### 5. Client returns, scans same QR
```sql
SELECT join_card('BOUTIQUEALI-A3F2', 'Fatima Zahra', '0555998877');
-- Returns: {success: true, is_new: false, points: 3, max_points: 10}
```

### 6. Merchant validates presence
```sql
SELECT validate_presence('client-card-uuid', 1, 'merchant-uuid');
-- Returns: {success: true, new_points: 4, reward_reached: false, new_code: '829461'}
-- Anti-cheat: cooldown 2h, max 5/day, code rotates
```

### 7. Client reaches reward
```sql
SELECT redeem_reward('client-card-uuid', 'merchant-uuid');
-- Returns: {success: true, reward: '10 achats = -20% 🎁', previous_points: 10}
-- Points reset to 0
```

### 8. Merchant requests upgrade
```sql
INSERT INTO payment_requests (merchant_id, requested_plan, payment_method, amount_dzd, contact_name, contact_phone)
VALUES ('merchant-uuid', 'pro', 'baridimob', 4500, 'Ali', '0555...');
```

### 9. Admin approves upgrade
```sql
UPDATE merchants SET plan = 'pro' WHERE id = 'merchant-uuid';
UPDATE payment_requests SET status = 'confirmed', processed_at = NOW() WHERE id = '...';
```

---

## 👁️ Views (5 views)

| View | Description | Used by |
|------|-------------|---------|
| `merchant_stats` | KPIs per merchant (clients, cards, points, rewards) | Dashboard Accueil |
| `card_stats` | Performance per card (clients, points, rewards) | Dashboard Mes cartes |
| `top_clients` | Ranked clients with progress % | Dashboard Statistiques |
| `platform_overview` | Global platform stats | Admin Panel |
| `daily_activity` | Activity per day per merchant (last 30 days) | Charts |
| `pending_payments` | Payment requests with merchant info | Admin Plans |

---

## ⚙️ Functions (6 functions)

| Function | Description |
|----------|-------------|
| `generate_card_code(name)` | Creates unique card code like `PIZZAORAN-A3F2` |
| `generate_presence_code()` | Creates random 6-digit code |
| `check_card_limit()` | Trigger: blocks card creation if plan limit reached |
| `check_client_limit()` | Trigger: blocks client if merchant's client limit reached |
| `validate_presence(cc_id, pts, merchant)` | Adds points with anti-cheat (cooldown, daily limit, code rotation) |
| `redeem_reward(cc_id, merchant)` | Exchanges reward, resets points to 0 |
| `join_card(code, name, phone)` | Client joins a card (new or returning) |
| `get_merchant_dashboard(merchant_id)` | Returns full dashboard data in one call |
| `expire_pending_presences()` | Cleans up expired presence requests |

---

## 🛡️ Anti-Cheat System

Built into `validate_presence()`:

| Protection | Value | Description |
|------------|-------|-------------|
| Cooldown | 2 hours | Same client can't validate twice within 2h |
| Daily limit | 5/day | Max 5 validations per client per day |
| Code rotation | Every validation | Presence code changes after each use |
| Audit trail | Full | Every point addition logged with timestamp |

---

## 💎 Plan Limits

Enforced by database triggers:

| Plan | Max Cards | Max Clients | Price |
|------|-----------|-------------|-------|
| Starter | 1 | 10 | 0 DA |
| Pro | 5 | 100 | 4,500 DA/mois |
| Premium | ∞ | ∞ | 9,000 DA/mois |

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled:

- **Merchants** can only see/edit their own data
- **Cards** are publicly readable (for QR scan joining) but only editable by owner
- **Client cards** only visible to the card's merchant
- **Activities** only visible to the merchant
- **Admin** can see everything

---

## 🔗 Entity Relationships

```
admins
  └── manages → merchants, payment_requests

merchants
  ├── has many → loyalty_cards
  ├── has many → activities
  ├── has many → payment_requests
  ├── has many → notifications
  └── has many → pending_presences

loyalty_cards
  ├── belongs to → merchants
  ├── has many → client_cards
  └── has many → activities

clients (no login)
  ├── has many → client_cards
  ├── has many → saved_cards
  └── has many → notifications

client_cards (pivot)
  ├── belongs to → clients
  ├── belongs to → loyalty_cards
  ├── has many → activities
  └── has many → pending_presences
```

---

## 🧪 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🍕 Merchant | `karim@pizzaoran.dz` | `demo123` |
| 💇 Merchant | `amina@salonbeaute.dz` | `demo123` |
| 🛡️ Admin | `admin@fidali.dz` | `admin123` |

---

## 📱 Supabase Integration

### Environment Variables needed:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Supabase Client setup:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Example API call:
```typescript
// Client scans QR
const { data, error } = await supabase.rpc('join_card', {
  p_card_code: 'PIZZAORAN-A001',
  p_client_name: 'Ahmed',
  p_client_phone: '0555112233'
})

// Merchant validates presence
const { data, error } = await supabase.rpc('validate_presence', {
  p_client_card_id: 'uuid...',
  p_points: 10,
  p_merchant_id: 'uuid...'
})
```
