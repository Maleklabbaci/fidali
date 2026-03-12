-- ============================================
-- FIDALI — Verify Database Setup
-- Run this after schema.sql to confirm everything works
-- ============================================

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 12 tables
-- admins, audit_log, client_cards, clients, loyalty_cards,
-- merchants, notifications, payment_requests, pending_presences,
-- platform_settings, saved_cards

-- 2. Check views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: 6 views
-- card_stats, daily_activity, merchant_stats, 
-- pending_payments, platform_overview, top_clients

-- 3. Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: check_card_limit, check_client_limit, 
-- expire_pending_presences, generate_card_code, 
-- generate_presence_code, get_merchant_dashboard,
-- join_card, redeem_reward, validate_presence

-- 4. Test demo data
SELECT '--- MERCHANTS ---' AS section;
SELECT id, email, business_name, plan, status FROM merchants;

SELECT '--- CARDS ---' AS section;
SELECT id, business_name, code, max_points FROM loyalty_cards;

SELECT '--- CLIENTS ---' AS section;
SELECT id, name, phone FROM clients;

SELECT '--- CLIENT CARDS ---' AS section;
SELECT cc.id, c.name, lc.business_name, cc.points, cc.presence_code
FROM client_cards cc
JOIN clients c ON c.id = cc.client_id
JOIN loyalty_cards lc ON lc.id = cc.card_id;

-- 5. Test join_card function
SELECT '--- TEST JOIN CARD ---' AS section;
SELECT join_card('PIZZAORAN-A001', 'Test Client', '0555000000');

-- 6. Test platform overview
SELECT '--- PLATFORM OVERVIEW ---' AS section;
SELECT * FROM platform_overview;

-- 7. Test merchant dashboard
SELECT '--- MERCHANT DASHBOARD ---' AS section;
SELECT get_merchant_dashboard('11111111-1111-1111-1111-111111111111');

-- 8. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- ============================================
-- If all queries return data, your setup is correct! ✅
-- ============================================
