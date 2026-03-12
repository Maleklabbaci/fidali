-- ============================================
-- FIDALI — Complete Database Schema
-- PostgreSQL / Supabase
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'premium');
CREATE TYPE merchant_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE activity_type AS ENUM ('join', 'pts', 'redeem');
CREATE TYPE points_rule_type AS ENUM ('visit', 'da', 'item', 'custom');
CREATE TYPE payment_method AS ENUM ('baridimob', 'ccp', 'especes');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'rejected', 'expired');
CREATE TYPE notification_type AS ENUM ('points_added', 'reward_reached', 'reward_redeemed', 'welcome', 'presence_refused');

-- ============================================
-- 2. ADMIN TABLE
-- ============================================

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Admin Fidali',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default admin (password: admin123)
-- In production, change this immediately
INSERT INTO admins (email, password_hash, name)
VALUES ('admin@fidali.dz', crypt('admin123', gen_salt('bf')), 'Admin Fidali');

-- ============================================
-- 3. MERCHANTS TABLE (Commerçants)
-- ============================================

CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Auth (will link to Supabase Auth later)
    auth_user_id UUID UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- Profile
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    sector TEXT NOT NULL DEFAULT 'autre',
    phone TEXT,
    logo_url TEXT,
    
    -- Plan & Status
    plan plan_type NOT NULL DEFAULT 'starter',
    status merchant_status NOT NULL DEFAULT 'pending',
    
    -- Settings
    welcome_message TEXT DEFAULT 'Bienvenue ! Gagnez des points à chaque visite 🎉',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_merchants_email ON merchants(email);
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_plan ON merchants(plan);
CREATE INDEX idx_merchants_sector ON merchants(sector);
CREATE INDEX idx_merchants_created ON merchants(created_at DESC);
CREATE INDEX idx_merchants_auth ON merchants(auth_user_id);

-- ============================================
-- 4. LOYALTY CARDS TABLE (Cartes de fidélité)
-- ============================================

CREATE TABLE loyalty_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Card Design
    business_name TEXT NOT NULL,
    color1 TEXT NOT NULL DEFAULT '#FF6B35',
    color2 TEXT NOT NULL DEFAULT '#FF9A5C',
    logo_emoji TEXT DEFAULT '🏪',
    
    -- Points Configuration
    points_rule TEXT NOT NULL DEFAULT '1 point par visite',
    points_rule_type points_rule_type NOT NULL DEFAULT 'visit',
    points_per_visit INTEGER NOT NULL DEFAULT 1,
    
    -- Reward
    reward TEXT NOT NULL DEFAULT 'Cadeau offert 🎁',
    max_points INTEGER NOT NULL DEFAULT 500,
    
    -- Welcome
    welcome_message TEXT DEFAULT 'Bienvenue ! Gagnez des points à chaque visite 🎉',
    
    -- Unique Code for QR
    code TEXT UNIQUE NOT NULL,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cards_merchant ON loyalty_cards(merchant_id);
CREATE INDEX idx_cards_code ON loyalty_cards(code);
CREATE INDEX idx_cards_active ON loyalty_cards(is_active);
CREATE INDEX idx_cards_created ON loyalty_cards(created_at DESC);

-- ============================================
-- 5. CLIENTS TABLE (Clients des commerçants)
-- ============================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity (no login required)
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Device recognition
    device_token TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_device ON clients(device_token);
CREATE INDEX idx_clients_created ON clients(created_at DESC);

-- Unique constraint: same phone = same client
-- (a client can have cards from multiple merchants)
CREATE UNIQUE INDEX idx_clients_phone_unique ON clients(phone);

-- ============================================
-- 6. CLIENT CARDS (Liaison client ↔ carte)
-- ============================================

CREATE TABLE client_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    
    -- Points
    points INTEGER NOT NULL DEFAULT 0,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    total_rewards_redeemed INTEGER NOT NULL DEFAULT 0,
    
    -- Anti-cheat
    last_validation_at TIMESTAMPTZ,
    daily_validation_count INTEGER NOT NULL DEFAULT 0,
    last_validation_date DATE,
    presence_code TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- A client can only have one card per loyalty program
    UNIQUE(client_id, card_id)
);

-- Indexes
CREATE INDEX idx_client_cards_client ON client_cards(client_id);
CREATE INDEX idx_client_cards_card ON client_cards(card_id);
CREATE INDEX idx_client_cards_points ON client_cards(points DESC);
CREATE INDEX idx_client_cards_created ON client_cards(created_at DESC);
CREATE INDEX idx_client_cards_presence ON client_cards(presence_code);

-- ============================================
-- 7. ACTIVITIES (Journal d'activité)
-- ============================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_card_id UUID REFERENCES client_cards(id) ON DELETE SET NULL,
    
    -- Activity
    type activity_type NOT NULL,
    points_amount INTEGER DEFAULT 0,
    description TEXT,
    
    -- Anti-cheat metadata
    validated_by TEXT, -- 'qr_scan', 'manual', 'code'
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_merchant ON activities(merchant_id);
CREATE INDEX idx_activities_client ON activities(client_id);
CREATE INDEX idx_activities_card ON activities(card_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_activities_merchant_date ON activities(merchant_id, created_at DESC);

-- ============================================
-- 8. PENDING PRESENCE (Présences en attente)
-- ============================================

CREATE TABLE pending_presences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_card_id UUID NOT NULL REFERENCES client_cards(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Client info (denormalized for quick display)
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired')),
    points_to_add INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    -- Auto-expire after 5 minutes
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes')
);

-- Indexes
CREATE INDEX idx_pending_merchant ON pending_presences(merchant_id, status);
CREATE INDEX idx_pending_client ON pending_presences(client_id);
CREATE INDEX idx_pending_status ON pending_presences(status);
CREATE INDEX idx_pending_expires ON pending_presences(expires_at);

-- ============================================
-- 9. PAYMENT REQUESTS (Demandes de paiement)
-- ============================================

CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Plan requested
    requested_plan plan_type NOT NULL,
    
    -- Payment info
    payment_method payment_method NOT NULL,
    amount_dzd INTEGER NOT NULL,
    
    -- Contact
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    
    -- Status
    status payment_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_payments_merchant ON payment_requests(merchant_id);
CREATE INDEX idx_payments_status ON payment_requests(status);
CREATE INDEX idx_payments_created ON payment_requests(created_at DESC);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Target (either merchant or client)
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Content
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Status
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notif_merchant ON notifications(merchant_id, is_read, created_at DESC);
CREATE INDEX idx_notif_client ON notifications(client_id, is_read, created_at DESC);

-- ============================================
-- 11. CLIENT SAVED CARDS (Device localStorage backup)
-- ============================================

CREATE TABLE saved_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    client_card_id UUID NOT NULL REFERENCES client_cards(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    
    -- Device info
    device_token TEXT NOT NULL,
    device_type TEXT, -- 'ios', 'android', 'web'
    
    -- Wallet
    added_to_apple_wallet BOOLEAN DEFAULT FALSE,
    added_to_google_wallet BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(client_id, card_id, device_token)
);

-- Indexes
CREATE INDEX idx_saved_device ON saved_cards(device_token);
CREATE INDEX idx_saved_client ON saved_cards(client_id);

-- ============================================
-- 12. PLATFORM SETTINGS (Config globale)
-- ============================================

CREATE TABLE platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value) VALUES
    ('plan_limits', '{"starter": {"cards": 1, "clients": 10}, "pro": {"cards": 5, "clients": 100}, "premium": {"cards": 999, "clients": 99999}}'),
    ('plan_prices', '{"starter": 0, "pro": 4500, "premium": 9000}'),
    ('cooldown_hours', '2'),
    ('max_daily_validations', '5'),
    ('presence_timeout_minutes', '5'),
    ('platform_name', '"Fidali"'),
    ('platform_version', '"2.0.0"');

-- ============================================
-- 13. AUDIT LOG (For admin tracking)
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    admin_id UUID REFERENCES admins(id),
    merchant_id UUID REFERENCES merchants(id),
    
    -- What
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'merchant', 'card', 'client', 'plan', etc.
    entity_id UUID,
    
    -- Details
    old_value JSONB,
    new_value JSONB,
    description TEXT,
    
    -- When
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_admin ON audit_log(admin_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);


-- ============================================
-- 14. VIEWS (Vues pratiques)
-- ============================================

-- Vue: Merchant Dashboard Stats
CREATE OR REPLACE VIEW merchant_stats AS
SELECT 
    m.id AS merchant_id,
    m.business_name,
    m.plan,
    m.status,
    COUNT(DISTINCT lc.id) AS total_cards,
    COUNT(DISTINCT cc.client_id) AS total_clients,
    COALESCE(SUM(cc.points), 0) AS total_active_points,
    COALESCE(SUM(cc.total_points_earned), 0) AS total_points_distributed,
    COALESCE(SUM(cc.total_rewards_redeemed), 0) AS total_rewards,
    m.created_at
FROM merchants m
LEFT JOIN loyalty_cards lc ON lc.merchant_id = m.id AND lc.is_active = TRUE
LEFT JOIN client_cards cc ON cc.card_id = lc.id
GROUP BY m.id;

-- Vue: Card Performance
CREATE OR REPLACE VIEW card_stats AS
SELECT 
    lc.id AS card_id,
    lc.merchant_id,
    lc.business_name,
    lc.code,
    lc.max_points,
    COUNT(DISTINCT cc.client_id) AS client_count,
    COALESCE(SUM(cc.points), 0) AS total_active_points,
    COALESCE(SUM(cc.total_points_earned), 0) AS total_points_earned,
    COALESCE(SUM(cc.total_rewards_redeemed), 0) AS rewards_redeemed,
    COALESCE(AVG(cc.points), 0) AS avg_points_per_client,
    lc.created_at
FROM loyalty_cards lc
LEFT JOIN client_cards cc ON cc.card_id = lc.id
GROUP BY lc.id;

-- Vue: Top Clients per Merchant
CREATE OR REPLACE VIEW top_clients AS
SELECT 
    cc.id AS client_card_id,
    c.id AS client_id,
    c.name AS client_name,
    c.phone AS client_phone,
    lc.merchant_id,
    lc.business_name,
    cc.points,
    cc.total_points_earned,
    cc.total_rewards_redeemed,
    lc.max_points,
    ROUND((cc.points::NUMERIC / NULLIF(lc.max_points, 0)) * 100, 1) AS progress_pct,
    cc.last_validation_at,
    cc.created_at
FROM client_cards cc
JOIN clients c ON c.id = cc.client_id
JOIN loyalty_cards lc ON lc.id = cc.card_id
ORDER BY cc.points DESC;

-- Vue: Platform Overview (for admin)
CREATE OR REPLACE VIEW platform_overview AS
SELECT
    (SELECT COUNT(*) FROM merchants) AS total_merchants,
    (SELECT COUNT(*) FROM merchants WHERE status = 'active') AS active_merchants,
    (SELECT COUNT(*) FROM merchants WHERE status = 'pending') AS pending_merchants,
    (SELECT COUNT(*) FROM merchants WHERE status = 'suspended') AS suspended_merchants,
    (SELECT COUNT(*) FROM merchants WHERE plan = 'starter') AS starter_count,
    (SELECT COUNT(*) FROM merchants WHERE plan = 'pro') AS pro_count,
    (SELECT COUNT(*) FROM merchants WHERE plan = 'premium') AS premium_count,
    (SELECT COUNT(*) FROM loyalty_cards WHERE is_active = TRUE) AS total_cards,
    (SELECT COUNT(*) FROM clients) AS total_clients,
    (SELECT COALESCE(SUM(total_points_earned), 0) FROM client_cards) AS total_points,
    (SELECT COALESCE(SUM(total_rewards_redeemed), 0) FROM client_cards) AS total_rewards,
    (SELECT COUNT(*) FROM activities WHERE created_at > NOW() - INTERVAL '24 hours') AS activities_today,
    (SELECT COUNT(*) FROM activities WHERE created_at > NOW() - INTERVAL '7 days') AS activities_week;

-- Vue: Daily Activity (for charts)
CREATE OR REPLACE VIEW daily_activity AS
SELECT 
    DATE(a.created_at) AS day,
    a.merchant_id,
    a.type,
    COUNT(*) AS count,
    COALESCE(SUM(a.points_amount), 0) AS total_points
FROM activities a
WHERE a.created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(a.created_at), a.merchant_id, a.type
ORDER BY day DESC;

-- Vue: Pending Payments (for admin)
CREATE OR REPLACE VIEW pending_payments AS
SELECT 
    pr.*,
    m.business_name,
    m.name AS merchant_name,
    m.email AS merchant_email,
    m.plan AS current_plan
FROM payment_requests pr
JOIN merchants m ON m.id = pr.merchant_id
ORDER BY pr.created_at DESC;


-- ============================================
-- 15. FUNCTIONS (Fonctions utilitaires)
-- ============================================

-- Function: Generate unique card code
CREATE OR REPLACE FUNCTION generate_card_code(biz_name TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_name TEXT;
    random_part TEXT;
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Clean business name
    clean_name := UPPER(REGEXP_REPLACE(biz_name, '[^a-zA-Z0-9]', '', 'g'));
    clean_name := LEFT(clean_name, 10);
    
    LOOP
        random_part := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));
        new_code := clean_name || '-' || random_part;
        
        SELECT EXISTS(SELECT 1 FROM loyalty_cards WHERE code = new_code) INTO code_exists;
        
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate presence code (6 digits)
CREATE OR REPLACE FUNCTION generate_presence_code()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function: Check plan limits before creating a card
CREATE OR REPLACE FUNCTION check_card_limit()
RETURNS TRIGGER AS $$
DECLARE
    merchant_plan plan_type;
    current_count INTEGER;
    max_cards INTEGER;
BEGIN
    SELECT plan INTO merchant_plan FROM merchants WHERE id = NEW.merchant_id;
    SELECT COUNT(*) INTO current_count FROM loyalty_cards WHERE merchant_id = NEW.merchant_id AND is_active = TRUE;
    
    CASE merchant_plan
        WHEN 'starter' THEN max_cards := 1;
        WHEN 'pro' THEN max_cards := 5;
        WHEN 'premium' THEN max_cards := 999;
    END CASE;
    
    IF current_count >= max_cards THEN
        RAISE EXCEPTION 'Card limit reached for plan %. Max: % cards', merchant_plan, max_cards;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_card_limit
    BEFORE INSERT ON loyalty_cards
    FOR EACH ROW
    EXECUTE FUNCTION check_card_limit();

-- Function: Check client limit before adding client to card
CREATE OR REPLACE FUNCTION check_client_limit()
RETURNS TRIGGER AS $$
DECLARE
    card_merchant_id UUID;
    merchant_plan plan_type;
    current_count INTEGER;
    max_clients INTEGER;
BEGIN
    SELECT merchant_id INTO card_merchant_id FROM loyalty_cards WHERE id = NEW.card_id;
    SELECT plan INTO merchant_plan FROM merchants WHERE id = card_merchant_id;
    
    SELECT COUNT(DISTINCT client_id) INTO current_count 
    FROM client_cards cc 
    JOIN loyalty_cards lc ON lc.id = cc.card_id 
    WHERE lc.merchant_id = card_merchant_id;
    
    CASE merchant_plan
        WHEN 'starter' THEN max_clients := 10;
        WHEN 'pro' THEN max_clients := 100;
        WHEN 'premium' THEN max_clients := 99999;
    END CASE;
    
    IF current_count >= max_clients THEN
        RAISE EXCEPTION 'Client limit reached for plan %. Max: % clients', merchant_plan, max_clients;
    END IF;
    
    -- Generate presence code
    NEW.presence_code := generate_presence_code();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_client_limit
    BEFORE INSERT ON client_cards
    FOR EACH ROW
    EXECUTE FUNCTION check_client_limit();

-- Function: Validate presence (anti-cheat)
CREATE OR REPLACE FUNCTION validate_presence(
    p_client_card_id UUID,
    p_points INTEGER,
    p_merchant_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_cc client_cards%ROWTYPE;
    v_card loyalty_cards%ROWTYPE;
    v_client clients%ROWTYPE;
    v_cooldown_hours INTEGER := 2;
    v_max_daily INTEGER := 5;
    v_time_since INTERVAL;
    v_new_points INTEGER;
    v_reward_reached BOOLEAN := FALSE;
BEGIN
    -- Get client card
    SELECT * INTO v_cc FROM client_cards WHERE id = p_client_card_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Client card not found');
    END IF;
    
    -- Get card info
    SELECT * INTO v_card FROM loyalty_cards WHERE id = v_cc.card_id;
    SELECT * INTO v_client FROM clients WHERE id = v_cc.client_id;
    
    -- Check cooldown
    IF v_cc.last_validation_at IS NOT NULL THEN
        v_time_since := NOW() - v_cc.last_validation_at;
        IF v_time_since < (v_cooldown_hours || ' hours')::INTERVAL THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Cooldown active. Réessayez dans ' || 
                    CEIL(EXTRACT(EPOCH FROM ((v_cooldown_hours || ' hours')::INTERVAL - v_time_since)) / 60)::TEXT || ' minutes'
            );
        END IF;
    END IF;
    
    -- Check daily limit
    IF v_cc.last_validation_date = CURRENT_DATE AND v_cc.daily_validation_count >= v_max_daily THEN
        RETURN jsonb_build_object('success', false, 'error', 'Limite quotidienne atteinte (max ' || v_max_daily || '/jour)');
    END IF;
    
    -- Add points
    v_new_points := v_cc.points + p_points;
    v_reward_reached := v_new_points >= v_card.max_points;
    
    -- Update client card
    UPDATE client_cards SET
        points = v_new_points,
        total_points_earned = total_points_earned + p_points,
        last_validation_at = NOW(),
        daily_validation_count = CASE 
            WHEN last_validation_date = CURRENT_DATE THEN daily_validation_count + 1 
            ELSE 1 
        END,
        last_validation_date = CURRENT_DATE,
        presence_code = generate_presence_code(), -- Rotate code
        updated_at = NOW()
    WHERE id = p_client_card_id;
    
    -- Log activity
    INSERT INTO activities (merchant_id, card_id, client_id, client_card_id, type, points_amount, validated_by)
    VALUES (p_merchant_id, v_cc.card_id, v_cc.client_id, p_client_card_id, 'pts', p_points, 'qr_scan');
    
    RETURN jsonb_build_object(
        'success', true,
        'client_name', v_client.name,
        'new_points', v_new_points,
        'max_points', v_card.max_points,
        'reward_reached', v_reward_reached,
        'new_code', (SELECT presence_code FROM client_cards WHERE id = p_client_card_id)
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Redeem reward
CREATE OR REPLACE FUNCTION redeem_reward(
    p_client_card_id UUID,
    p_merchant_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_cc client_cards%ROWTYPE;
    v_card loyalty_cards%ROWTYPE;
    v_client clients%ROWTYPE;
BEGIN
    SELECT * INTO v_cc FROM client_cards WHERE id = p_client_card_id;
    SELECT * INTO v_card FROM loyalty_cards WHERE id = v_cc.card_id;
    SELECT * INTO v_client FROM clients WHERE id = v_cc.client_id;
    
    IF v_cc.points < v_card.max_points THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not enough points');
    END IF;
    
    -- Reset points and increment rewards
    UPDATE client_cards SET
        points = 0,
        total_rewards_redeemed = total_rewards_redeemed + 1,
        updated_at = NOW()
    WHERE id = p_client_card_id;
    
    -- Log activity
    INSERT INTO activities (merchant_id, card_id, client_id, client_card_id, type, points_amount, description)
    VALUES (p_merchant_id, v_cc.card_id, v_cc.client_id, p_client_card_id, 'redeem', v_cc.points, v_card.reward);
    
    RETURN jsonb_build_object(
        'success', true,
        'client_name', v_client.name,
        'reward', v_card.reward,
        'previous_points', v_cc.points
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Join card (client scans QR)
CREATE OR REPLACE FUNCTION join_card(
    p_card_code TEXT,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_device_token TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_card loyalty_cards%ROWTYPE;
    v_client clients%ROWTYPE;
    v_client_card client_cards%ROWTYPE;
    v_existing_cc client_cards%ROWTYPE;
    v_client_id UUID;
    v_cc_id UUID;
BEGIN
    -- Find card by code
    SELECT * INTO v_card FROM loyalty_cards WHERE code = UPPER(p_card_code) AND is_active = TRUE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Carte introuvable');
    END IF;
    
    -- Check if client exists by phone
    SELECT * INTO v_client FROM clients WHERE phone = p_client_phone;
    
    IF FOUND THEN
        v_client_id := v_client.id;
        -- Update name if changed
        UPDATE clients SET name = p_client_name, updated_at = NOW() WHERE id = v_client_id;
        
        -- Check if already has this card
        SELECT * INTO v_existing_cc FROM client_cards WHERE client_id = v_client_id AND card_id = v_card.id;
        IF FOUND THEN
            -- Returning client - create pending presence
            RETURN jsonb_build_object(
                'success', true,
                'is_new', false,
                'client_id', v_client_id,
                'client_card_id', v_existing_cc.id,
                'points', v_existing_cc.points,
                'max_points', v_card.max_points,
                'business_name', v_card.business_name,
                'client_name', p_client_name
            );
        END IF;
    ELSE
        -- New client
        INSERT INTO clients (name, phone, device_token)
        VALUES (p_client_name, p_client_phone, p_device_token)
        RETURNING id INTO v_client_id;
    END IF;
    
    -- Create client card (trigger will check limits + generate presence code)
    INSERT INTO client_cards (client_id, card_id)
    VALUES (v_client_id, v_card.id)
    RETURNING id INTO v_cc_id;
    
    -- Log join activity
    INSERT INTO activities (merchant_id, card_id, client_id, client_card_id, type, points_amount)
    VALUES (v_card.merchant_id, v_card.id, v_client_id, v_cc_id, 'join', 0);
    
    RETURN jsonb_build_object(
        'success', true,
        'is_new', true,
        'client_id', v_client_id,
        'client_card_id', v_cc_id,
        'points', 0,
        'max_points', v_card.max_points,
        'business_name', v_card.business_name,
        'client_name', p_client_name,
        'welcome_message', v_card.welcome_message
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Expire old pending presences
CREATE OR REPLACE FUNCTION expire_pending_presences()
RETURNS void AS $$
BEGIN
    UPDATE pending_presences 
    SET status = 'expired', resolved_at = NOW()
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Get merchant dashboard data
CREATE OR REPLACE FUNCTION get_merchant_dashboard(p_merchant_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats RECORD;
    v_recent_clients JSONB;
    v_recent_activities JSONB;
BEGIN
    -- Get stats
    SELECT * INTO v_stats FROM merchant_stats WHERE merchant_id = p_merchant_id;
    
    -- Get recent clients (last 10)
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_recent_clients
    FROM (
        SELECT c.name, c.phone, cc.points, cc.created_at,
               lc.business_name, lc.max_points
        FROM client_cards cc
        JOIN clients c ON c.id = cc.client_id
        JOIN loyalty_cards lc ON lc.id = cc.card_id
        WHERE lc.merchant_id = p_merchant_id
        ORDER BY cc.created_at DESC
        LIMIT 10
    ) t;
    
    -- Get recent activities (last 20)
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_recent_activities
    FROM (
        SELECT a.type, a.points_amount, a.created_at,
               c.name AS client_name, lc.business_name
        FROM activities a
        JOIN clients c ON c.id = a.client_id
        JOIN loyalty_cards lc ON lc.id = a.card_id
        WHERE a.merchant_id = p_merchant_id
        ORDER BY a.created_at DESC
        LIMIT 20
    ) t;
    
    RETURN jsonb_build_object(
        'total_clients', COALESCE(v_stats.total_clients, 0),
        'total_cards', COALESCE(v_stats.total_cards, 0),
        'total_points', COALESCE(v_stats.total_points_distributed, 0),
        'total_rewards', COALESCE(v_stats.total_rewards, 0),
        'recent_clients', v_recent_clients,
        'recent_activities', v_recent_activities
    );
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 16. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

-- Merchants: can only see/edit their own data
CREATE POLICY merchants_own ON merchants
    FOR ALL USING (auth_user_id = auth.uid());

-- Admin can see all merchants
CREATE POLICY merchants_admin ON merchants
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
    );

-- Cards: merchant sees own cards, public can see active cards (for joining)
CREATE POLICY cards_merchant ON loyalty_cards
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid()));

CREATE POLICY cards_public_read ON loyalty_cards
    FOR SELECT USING (is_active = TRUE);

-- Client cards: merchant sees cards for their loyalty programs
CREATE POLICY client_cards_merchant ON client_cards
    FOR ALL USING (
        card_id IN (
            SELECT id FROM loyalty_cards WHERE merchant_id IN (
                SELECT id FROM merchants WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Activities: merchant sees own activities
CREATE POLICY activities_merchant ON activities
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid()));

-- Pending presences: merchant sees own
CREATE POLICY pending_merchant ON pending_presences
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid()));

-- Payment requests: merchant sees own
CREATE POLICY payments_merchant ON payment_requests
    FOR ALL USING (merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid()));

-- Notifications: user sees own
CREATE POLICY notif_merchant ON notifications
    FOR SELECT USING (merchant_id IN (SELECT id FROM merchants WHERE auth_user_id = auth.uid()));

CREATE POLICY notif_client ON notifications
    FOR SELECT USING (client_id IS NOT NULL); -- Clients don't have auth, public access


-- ============================================
-- 17. CRON JOBS (via pg_cron or Supabase Edge Functions)
-- ============================================

-- These should be set up as Supabase Edge Functions or pg_cron jobs:

-- 1. Expire pending presences every minute
-- SELECT cron.schedule('expire-presences', '* * * * *', 'SELECT expire_pending_presences()');

-- 2. Reset daily validation counts at midnight
-- SELECT cron.schedule('reset-daily-counts', '0 0 * * *', 
--   'UPDATE client_cards SET daily_validation_count = 0, last_validation_date = NULL WHERE daily_validation_count > 0');

-- 3. Auto-expire payment requests after 7 days
-- SELECT cron.schedule('expire-payments', '0 0 * * *',
--   'UPDATE payment_requests SET status = ''expired'' WHERE status = ''pending'' AND created_at < NOW() - INTERVAL ''7 days''');


-- ============================================
-- 18. SEED DATA (Demo data)
-- ============================================

-- Demo Merchant 1: Pizza Oran
INSERT INTO merchants (id, email, password_hash, name, business_name, sector, phone, plan, status, validated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'karim@pizzaoran.dz',
    crypt('demo123', gen_salt('bf')),
    'Karim Boudiaf',
    'Pizza Oran 🍕',
    'restaurant',
    '0555 12 34 56',
    'starter',
    'active',
    NOW()
);

-- Demo Merchant 2: Salon Beauté
INSERT INTO merchants (id, email, password_hash, name, business_name, sector, phone, plan, status, validated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'amina@salonbeaute.dz',
    crypt('demo123', gen_salt('bf')),
    'Amina Hadj',
    'Salon Beauté Alger 💇',
    'salon',
    '0555 98 76 54',
    'pro',
    'active',
    NOW()
);

-- Demo Card 1
INSERT INTO loyalty_cards (id, merchant_id, business_name, color1, color2, logo_emoji, points_rule, points_rule_type, points_per_visit, reward, max_points, welcome_message, code)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Pizza Oran 🍕',
    '#FF6B35', '#FF9A5C', '🍕',
    '1 point par 100 DA',
    'da', 10,
    '500 pts = 1 repas offert 🎁',
    500,
    'Bienvenue chez Pizza Oran ! 🍕',
    'PIZZAORAN-A001'
);

-- Demo Card 2
INSERT INTO loyalty_cards (id, merchant_id, business_name, color1, color2, logo_emoji, points_rule, points_rule_type, points_per_visit, reward, max_points, welcome_message, code)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Salon Beauté Alger 💇',
    '#FF6B9D', '#FFB3CD', '💇',
    '1 point par visite',
    'visit', 1,
    '10 visites = 1 soin offert 💆',
    10,
    'Bienvenue au Salon Beauté ! 💇',
    'SALONBEAUTE-B001'
);

-- Demo Clients
INSERT INTO clients (id, name, phone) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Ahmed Benali', '0555112233'),
    ('c2222222-2222-2222-2222-222222222222', 'Sarah Mansouri', '0555445566'),
    ('c3333333-3333-3333-3333-333333333333', 'Youcef Kaddour', '0555778899'),
    ('c4444444-4444-4444-4444-444444444444', 'Amina Cherif', '0555334455'),
    ('c5555555-5555-5555-5555-555555555555', 'Reda Bouzid', '0555667788');

-- Demo Client Cards (for Pizza Oran)
INSERT INTO client_cards (client_id, card_id, points, total_points_earned, presence_code, last_validation_at) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 350, 350, '482917', NOW() - INTERVAL '2 hours'),
    ('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 120, 120, '739261', NOW() - INTERVAL '1 day'),
    ('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 480, 480, '156834', NOW() - INTERVAL '3 hours'),
    ('c4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 210, 210, '924567', NOW() - INTERVAL '5 hours'),
    ('c5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 150, 150, '371892', NOW() - INTERVAL '1 day');

-- Demo Client Cards (for Salon Beauté - first 3 clients)
INSERT INTO client_cards (client_id, card_id, points, total_points_earned, presence_code, last_validation_at) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 7, 7, '592847', NOW() - INTERVAL '4 hours'),
    ('c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 3, 3, '814625', NOW() - INTERVAL '2 days'),
    ('c3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, 5, '267493', NOW() - INTERVAL '6 hours');

-- Demo Activities
INSERT INTO activities (merchant_id, card_id, client_id, type, points_amount, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'join', 0, NOW() - INTERVAL '30 days'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'pts', 100, NOW() - INTERVAL '25 days'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'pts', 150, NOW() - INTERVAL '15 days'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'pts', 100, NOW() - INTERVAL '2 hours'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c2222222-2222-2222-2222-222222222222', 'join', 0, NOW() - INTERVAL '20 days'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c2222222-2222-2222-2222-222222222222', 'pts', 120, NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c3333333-3333-3333-3333-333333333333', 'join', 0, NOW() - INTERVAL '15 days'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c3333333-3333-3333-3333-333333333333', 'pts', 480, NOW() - INTERVAL '3 hours'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c1111111-1111-1111-1111-111111111111', 'join', 0, NOW() - INTERVAL '10 days'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c1111111-1111-1111-1111-111111111111', 'pts', 7, NOW() - INTERVAL '4 hours');


-- ============================================
-- DONE! 🎯
-- ============================================
-- 
-- Tables: 13
-- Views: 5
-- Functions: 6
-- Triggers: 2
-- Indexes: 30+
-- RLS Policies: 9
--
-- Demo accounts:
-- Merchant: karim@pizzaoran.dz / demo123
-- Merchant: amina@salonbeaute.dz / demo123
-- Admin: admin@fidali.dz / admin123
--
-- ============================================
