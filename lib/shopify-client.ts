// lib/shopify-client.ts
import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const ENCRYPTION_KEY = process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY!;

// Encrypt token avant stockage DB
export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt token depuis DB
export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Générer URL OAuth installation
export function getInstallUrl(shop: string): string {
  const redirectUri = `${APP_URL}/api/shopify/auth/callback`;
  const state = crypto.randomBytes(16).toString('hex');
  
  return `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${redirectUri}&state=${state}`;
}

// Échanger code contre access token
export async function getAccessToken(shop: string, code: string): Promise<string> {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

// Shopify API helper
export class ShopifyAPI {
  constructor(private shop: string, private accessToken: string) {}

  async request(endpoint: string, method = 'GET', body?: any) {
    const url = `https://${this.shop}/admin/api/2025-10${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return response.json();
  }

  // Créer Price Rule
  async createPriceRule(config: {
    title: string;
    value_type: 'percentage' | 'fixed_amount';
    value: string;
    target_type?: string;
    allocation_method?: string;
  }) {
    return this.request('/price_rules.json', 'POST', {
      price_rule: {
        title: config.title,
        target_type: config.target_type || 'line_item',
        target_selection: 'all',
        allocation_method: config.allocation_method || 'across',
        value_type: config.value_type,
        value: config.value,
        customer_selection: 'all',
        starts_at: new Date().toISOString(),
      },
    });
  }

  // Créer Discount Code
  async createDiscountCode(priceRuleId: string, code: string) {
    return this.request(`/price_rules/${priceRuleId}/discount_codes.json`, 'POST', {
      discount_code: { code },
    });
  }

  // Installer script tag (widget)
  async createScriptTag(src: string) {
    return this.request('/script_tags.json', 'POST', {
      script_tag: {
        event: 'onload',
        src,
      },
    });
  }
}
