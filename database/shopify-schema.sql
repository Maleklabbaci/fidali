-- Shopify Integration Tables

-- Table pour stocker les connexions Shopify
CREATE TABLE IF NOT EXISTS shopify_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL, -- encrypted
  scopes TEXT[] NOT NULL,
  
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  uninstalled_at TIMESTAMPTZ,
  
  UNIQUE(merchant_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_stores_merchant ON shopify_stores(merchant_id);
CREATE INDEX IF NOT EXISTS idx_shopify_stores_shop ON shopify_stores(shop_domain);

-- Table pour les codes promo générés
CREATE TABLE IF NOT EXISTS shopify_discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  code TEXT UNIQUE NOT NULL,
  
  -- Shopify IDs
  shopify_price_rule_id TEXT NOT NULL,
  shopify_discount_code_id TEXT NOT NULL,
  
  -- Config
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'shipping'
  discount_value DECIMAL NOT NULL,
  
  -- Status
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  order_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_merchant ON shopify_discount_codes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_client ON shopify_discount_codes(client_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON shopify_discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_status ON shopify_discount_codes(used_at, expires_at);
