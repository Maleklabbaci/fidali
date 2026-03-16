import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, isAuthError, getSupabaseAdmin } from '@/lib/api-auth'

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Réponse avec CORS
function cors(data: any, status: number = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

// Preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...corsHeaders, 'Access-Control-Max-Age': '86400' } })
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateApiKey(req)
  if (isAuthError(authResult)) {
    return cors({ error: 'Invalid or unauthorized API key' }, 401)
  }

  const { merchantId } = authResult
  const db = getSupabaseAdmin() as any

  try {
    const body = await req.json()
    const { card_code, phone, name, points } = body

    if (!card_code || !phone || !name) {
      return cors({ error: 'card_code, phone et name sont requis' }, 400)
    }

    const pointsToAdd = points || 1

    const phoneClean = phone.replace(/\s/g, '')
    const phoneFormatted = phoneClean.startsWith('+')
      ? phoneClean
      : phoneClean.startsWith('0')
        ? '+213' + phoneClean.slice(1)
        : phoneClean

    // 1. Trouver la carte
    const { data: card } = await db
      .from('loyalty_cards')
      .select('id, max_points, reward, points_per_visit, merchant_id, business_name')
      .eq('code', card_code.toUpperCase())
      .eq('is_active', true)
      .eq('merchant_id', merchantId)
      .maybeSingle()

    if (!card) return cors({ error: 'Carte introuvable' }, 404)

    // 2. Chercher le client
    let client = null
    let isNewClient = false

    const { data: existingClient } = await db
      .from('clients')
      .select('id, name')
      .or(`phone.eq.${phoneClean},phone.eq.${phoneFormatted}`)
      .maybeSingle()

    if (existingClient) {
      client = existingClient
    } else {
      isNewClient = true
      const { data: newClient, error: clientError } = await db
        .from('clients')
       .insert({ name, phone: phoneFormatted })
        .select()
        .maybeSingle()

      if (clientError) {
        const { data: retryClient } = await db
          .from('clients')
          .select('id, name')
          .or(`phone.eq.${phoneClean},phone.eq.${phoneFormatted}`)
          .maybeSingle()

        if (retryClient) {
          client = retryClient
          isNewClient = false
        } else {
          return cors({ error: 'Erreur création client: ' + clientError.message }, 500)
        }
      } else {
        client = newClient
      }
    }

    if (!client) return cors({ error: 'Erreur client' }, 500)

    // 3. Chercher ou créer le client_card
    let clientCard = null

    const { data: existingCC } = await db
      .from('client_cards')
      .select('id, points, total_visits, total_rewards_redeemed')
      .eq('client_id', client.id)
      .eq('card_id', card.id)
      .maybeSingle()

    if (existingCC) {
      clientCard = existingCC
    } else {
      const { data: newCC, error: ccError } = await db
        .from('client_cards')
        .insert({
          client_id: client.id, card_id: card.id, merchant_id: merchantId,
          points: 0, total_visits: 0, total_rewards_redeemed: 0,
        })
        .select()
        .maybeSingle()

      if (ccError) return cors({ error: 'Erreur inscription carte: ' + ccError.message }, 500)
      clientCard = newCC
    }

    if (!clientCard) return cors({ error: 'Erreur carte client' }, 500)

    // 4. Ajouter les points
    const newPoints = Math.min(clientCard.points + pointsToAdd, card.max_points)
    const rewardReached = newPoints >= card.max_points

    await db.from('client_cards').update({
      points: newPoints,
      last_visit_at: new Date().toISOString(),
      total_visits: (clientCard.total_visits || 0) + 1,
    }).eq('id', clientCard.id)

    // 5. Log
    await db.from('activities').insert({
      merchant_id: merchantId, client_id: client.id, card_id: card.id,
      type: 'points_added', points_changed: pointsToAdd,
      description: isNewClient
        ? `Nouveau client auto-inscrit + ${pointsToAdd} point(s) via API`
        : `+${pointsToAdd} point(s) via API`,
      created_at: new Date().toISOString(),
    })

    return cors({
      success: true,
      new_client: isNewClient,
      client_name: client.name,
      points: newPoints,
      max_points: card.max_points,
      total_visits: (clientCard.total_visits || 0) + 1,
      reward_reached: rewardReached,
      reward: rewardReached ? card.reward : null,
      card_name: card.business_name,
    })

  } catch (e: any) {
    console.error('Auto-points error:', e)
    return cors({ error: e.message }, 500)
  }
}
