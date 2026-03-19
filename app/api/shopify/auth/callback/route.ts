// app/api/shopify/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, encryptToken, ShopifyAPI } from '@/lib/shopify-client';
import { supabase } from '@/database/supabase-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const shop = searchParams.get('shop');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Validation
  if (!shop || !code) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // 1. Échanger code contre access token
    const accessToken = await getAccessToken(shop, code);

    // 2. Encrypt token
    const encryptedToken = encryptToken(accessToken);

    // 3. Créer ou récupérer merchant
    // D'abord check si ce shop existe déjà
    const { data: existingStore } = await supabase
      .from('shopify_stores')
      .select('merchant_id')
      .eq('shop_domain', shop)
      .maybeSingle();

    let merchantId: string;

    if (existingStore) {
      // Store existe déjà, update token
      merchantId = existingStore.merchant_id;
      
      await supabase
        .from('shopify_stores')
        .update({
          access_token: encryptedToken,
          scopes: process.env.SHOPIFY_SCOPES!.split(','),
          uninstalled_at: null,
        })
        .eq('shop_domain', shop);

    } else {
      // Nouveau shop, créer merchant + store
      
      // Créer merchant
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          email: `${shop.replace('.myshopify.com', '')}@shopify.fidali.dz`,
          password_hash: 'shopify_oauth', // Pas de password, OAuth only
          name: shop.replace('.myshopify.com', ''),
          business_name: shop.replace('.myshopify.com', ''),
          status: 'active', // Auto-approve Shopify merchants
          plan: 'pro', // Start avec Pro
        })
        .select()
        .single();

      if (merchantError || !merchant) {
        throw new Error('Failed to create merchant');
      }

      merchantId = merchant.id;

      // Créer shopify_store
      await supabase
        .from('shopify_stores')
        .insert({
          merchant_id: merchantId,
          shop_domain: shop,
          access_token: encryptedToken,
          scopes: process.env.SHOPIFY_SCOPES!.split(','),
        });

      // Créer carte de fidélité par défaut
      const cardCode = `SHOP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      await supabase
        .from('loyalty_cards')
        .insert({
          merchant_id: merchantId,
          business_name: shop.replace('.myshopify.com', ''),
          code: cardCode,
          points_rule: '1 point par achat',
          points_rule_type: 'visit',
          points_per_visit: 1,
          reward: 'Récompense fidélité',
          max_points: 20,
          welcome_message: 'Merci pour votre achat! Gagnez des points à chaque commande.',
        });

      // Installer script tag (widget)
      const shopifyAPI = new ShopifyAPI(shop, accessToken);
      const widgetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/widget.js?card=${cardCode}&key=${merchantId}`;
      
      await shopifyAPI.createScriptTag(widgetUrl);
    }

    // 4. Créer session et redirect vers dashboard
    // Pour l'instant, simple redirect avec merchantId en query
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shopify?merchant=${merchantId}&shop=${shop}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('[Shopify OAuth] Error:', error);
    return NextResponse.json({ 
      error: 'Installation failed', 
      details: error.message 
    }, { status: 500 });
  }
}
