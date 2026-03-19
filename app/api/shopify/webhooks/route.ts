// app/api/shopify/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/database/supabase-client';
import { decryptToken, ShopifyAPI } from '@/lib/shopify-client';
import crypto from 'crypto';

// Vérifier signature Shopify
function verifyWebhook(body: string, hmac: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET!)
    .update(body, 'utf8')
    .digest('base64');
  return hash === hmac;
}

export async function POST(req: NextRequest) {
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  const topic = req.headers.get('x-shopify-topic');
  const shop = req.headers.get('x-shopify-shop-domain');

  if (!hmac || !topic || !shop) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
  }

  const body = await req.text();

  // Vérifier signature
  if (!verifyWebhook(body, hmac)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const data = JSON.parse(body);

  try {
    // Router selon le topic
    switch (topic) {
      case 'orders/create':
        await handleOrderCreate(shop, data);
        break;

      case 'app/uninstalled':
        await handleAppUninstall(shop);
        break;

      case 'customers/data_request':
        await handleCustomerDataRequest(shop, data);
        break;

      case 'customers/redact':
        await handleCustomerRedact(shop, data);
        break;

      case 'shop/redact':
        await handleShopRedact(shop);
        break;

      default:
        console.log(`[Webhook] Unhandled topic: ${topic}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error(`[Webhook] Error processing ${topic}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handler: Nouvelle commande
async function handleOrderCreate(shop: string, order: any) {
  console.log(`[Webhook] Order created on ${shop}:`, order.id);

  // 1. Récupérer merchant
  const { data: store } = await supabase
    .from('shopify_stores')
    .select('merchant_id')
    .eq('shop_domain', shop)
    .single();

  if (!store) {
    console.error('[Webhook] Store not found:', shop);
    return;
  }

  // 2. Récupérer client par phone ou email
  const customerPhone = order.customer?.phone || order.shipping_address?.phone;
  const customerEmail = order.customer?.email;

  if (!customerPhone && !customerEmail) {
    console.log('[Webhook] No customer contact info');
    return;
  }

  // Chercher client existant
  let client;
  if (customerPhone) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', customerPhone)
      .maybeSingle();
    client = data;
  }

  // Si pas trouvé par phone, chercher par email
  if (!client && customerEmail) {
    // Créer client si existe pas
    const { data: newClient } = await supabase
      .from('clients')
      .insert({
        name: order.customer?.first_name || 'Client Shopify',
        phone: customerPhone || customerEmail,
      })
      .select()
      .single();
    client = newClient;
  }

  if (!client) return;

  // 3. Récupérer carte merchant
  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('merchant_id', store.merchant_id)
    .eq('is_active', true)
    .single();

  if (!card) return;

  // 4. Récupérer ou créer client_card
  let { data: clientCard } = await supabase
    .from('client_cards')
    .select('*')
    .eq('client_id', client.id)
    .eq('card_id', card.id)
    .maybeSingle();

  if (!clientCard) {
    const { data: newCard } = await supabase
      .from('client_cards')
      .insert({
        client_id: client.id,
        card_id: card.id,
        points: 0,
      })
      .select()
      .single();
    clientCard = newCard;
  }

  // 5. Ajouter points
  const pointsToAdd = card.points_per_visit || 1;
  const newPoints = clientCard.points + pointsToAdd;
  const rewardReached = newPoints >= card.max_points;

  await supabase
    .from('client_cards')
    .update({
      points: newPoints,
      total_points_earned: clientCard.total_points_earned + pointsToAdd,
      last_validation_at: new Date().toISOString(),
    })
    .eq('id', clientCard.id);

  // 6. Logger activité
  await supabase.from('activities').insert({
    merchant_id: store.merchant_id,
    card_id: card.id,
    client_id: client.id,
    client_card_id: clientCard.id,
    type: 'pts',
    points_amount: pointsToAdd,
    description: `Shopify order #${order.order_number}`,
  });

  // 7. Si reward atteinte, créer discount code
  if (rewardReached) {
    await createDiscountCodeForClient(shop, store.merchant_id, client.id, card);
  }
}

// Créer code promo Shopify
async function createDiscountCodeForClient(
  shop: string,
  merchantId: string,
  clientId: string,
  card: any
) {
  // Récupérer access token
  const { data: store } = await supabase
    .from('shopify_stores')
    .select('access_token')
    .eq('shop_domain', shop)
    .single();

  if (!store) return;

  const accessToken = decryptToken(store.access_token);
  const shopifyAPI = new ShopifyAPI(shop, accessToken);

  // Générer code unique
  const code = `FIDALI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Créer price rule (10% off par défaut)
  const priceRule = await shopifyAPI.createPriceRule({
    title: `Fidali - ${card.reward}`,
    value_type: 'percentage',
    value: '-10.0',
  });

  // Créer discount code
  const discount = await shopifyAPI.createDiscountCode(
    priceRule.price_rule.id,
    code
  );

  // Stocker en DB
  await supabase.from('shopify_discount_codes').insert({
    merchant_id: merchantId,
    client_id: clientId,
    code,
    shopify_price_rule_id: priceRule.price_rule.id.toString(),
    shopify_discount_code_id: discount.discount_code.id.toString(),
    discount_type: 'percentage',
    discount_value: 10,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
  });

  console.log(`[Webhook] Created discount code: ${code}`);
}

// Handler: App uninstalled
async function handleAppUninstall(shop: string) {
  await supabase
    .from('shopify_stores')
    .update({ uninstalled_at: new Date().toISOString() })
    .eq('shop_domain', shop);

  console.log(`[Webhook] App uninstalled from ${shop}`);
}

// GDPR Handlers (obligatoires)
async function handleCustomerDataRequest(shop: string, data: any) {
  // Préparer export des données client
  console.log(`[GDPR] Data request for shop ${shop}, customer ${data.customer.id}`);
  // TODO: Implement data export
}

async function handleCustomerRedact(shop: string, data: any) {
  // Anonymiser données client
  console.log(`[GDPR] Redact customer for shop ${shop}, customer ${data.customer.id}`);
  // TODO: Implement customer data deletion
}

async function handleShopRedact(shop: string) {
  // Supprimer toutes données du shop après 48h uninstall
  console.log(`[GDPR] Redact shop ${shop}`);
  await supabase
    .from('shopify_stores')
    .delete()
    .eq('shop_domain', shop);
}
