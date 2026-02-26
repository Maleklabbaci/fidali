-- ============================================
-- FIDALI — Enable Realtime for Key Tables
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- Enable realtime for presence validation
-- (Client waits for merchant to confirm)
ALTER PUBLICATION supabase_realtime ADD TABLE pending_presences;

-- Enable realtime for client card updates
-- (Client sees points update in real-time)
ALTER PUBLICATION supabase_realtime ADD TABLE client_cards;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- Verify realtime is enabled
-- ============================================
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- ============================================
-- IMPORTANT: Also enable in Supabase Dashboard:
-- 1. Go to Database → Replication
-- 2. Enable for: pending_presences, client_cards, notifications
-- ============================================
