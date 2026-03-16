import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey, getServiceClient } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  // Vérifier la clé API
  const auth = await verifyApiKey(req)
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const db = getServiceClient() as any
  const merchant = auth.merchant

  try {
    const body = await req.json()
    const { card_code, phone, name, points } = body

    if (!card_code || !phone || !name) {
      return NextResponse.json({
        error: 'card_code, phone et name sont requis'
      }, { status: 400 })
    }

    const pointsToAdd = points || 1

    // Formater le téléphone
    const phoneClean = phone.replace(/\s/g, '')
    const phoneFormatted = phoneClean.startsWith('+')
      ? phoneClean
      : phoneClean.startsWith('0')
        ? '+213' + phoneClean.slice(1)
        : phoneClean

    // 1. Trouver la carte
    const { data: card, error: cardError } = await db
      .from('loyalty_cards')
      .select('id, max_points, reward, points_per_visit, merchant_id, business_name')
      .eq('code', card_code.toUpperCase())
      .eq('is_active', true)
      .eq('merchant_id', merchant.id)
      .maybeSingle()

    if (cardError || !card) {
      return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 })
    }

    // 2. Chercher le client (par téléphone)
    let client = null
    const { data: existingClient } = await db
      .from('clients')
      .select('id, name')
      .or(`phone.eq.${phoneClean},phone.eq.${phoneFormatted}`)
      .maybeSingle()

    if (existingClient) {
      client = existingClient
    } else {
      // 3. ✅ Créer le client automatiquement
      const { data: newClient, error: clientError } = await db
        .from('clients')
        .insert({
          name: name,
          phone: phoneFormatted,
          merchant_id: merchant.id,
        })
        .select()
        .maybeSingle()

      if (clientError) {
        // Peut-être que le client existe avec un format différent
        const { data: retryClient } = await db
          .from('clients')
          .select('id, name')
          .or(`phone.eq.${phoneClean},phone.eq.${phoneFormatted}`)
          .maybeSingle()

        if (retryClient) {
          client = retryClient
        } else {
          return NextResponse.json({ error: 'Erreur création client: ' + clientError.message }, { status: 500 })
        }
      } else {
        client = newClient
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Erreur client introuvable' }, { status: 500 })
    }

    // 4. Chercher ou créer le client_card
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
      // ✅ Inscrire le client à la carte automatiquement
      const { data: newCC, error: ccError } = await db
        .from('client_cards')
        .insert({
          client_id: client.id,
          card_id: card.id,
          merchant_id: merchant.id,
          points: 0,
          total_visits: 0,
          total_rewards_redeemed: 0,
        })
        .select()
        .maybeSingle()

      if (ccError) {
        return NextResponse.json({ error: 'Erreur inscription carte: ' + ccError.message }, { status: 500 })
      }

      clientCard = newCC
    }

    if (!clientCard) {
      return NextResponse.json({ error: 'Erreur carte client' }, { status: 500 })
    }

    // 5. Ajouter les points
    const newPoints = Math.min(clientCard.points + pointsToAdd, card.max_points)
    const rewardReached = newPoints >= card.max_points
    const isNewClient = !existingClient

    await db
      .from('client_cards')
      .update({
        points: newPoints,
        last_visit_at: new Date().toISOString(),
        total_visits: (clientCard.total_visits || 0) + 1,
      })
      .eq('id', clientCard.id)

    // 6. Log l'activité
    await db.from('activities').insert({
      merchant_id: merchant.id,
      client_id: client.id,
      card_id: card.id,
      type: 'points_added',
      points_changed: pointsToAdd,
      description: isNewClient
        ? `Nouveau client auto-inscrit + ${pointsToAdd} point(s) via API`
        : `+${pointsToAdd} point(s) via API`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
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
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
