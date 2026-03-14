// app/api/v1/points/add/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, isAuthError, getSupabaseAdmin } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (isAuthError(auth)) return auth

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { card_code, phone, points = 1 } = body

  if (!card_code || !phone) {
    return NextResponse.json({ error: 'card_code and phone are required' }, { status: 400 })
  }

  if (typeof points !== 'number' || points < 1 || points > 100) {
    return NextResponse.json({ error: 'points must be a number between 1 and 100' }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: card, error: cardErr } = await supabaseAdmin
      .from('loyalty_cards')
      .select('id, merchant_id, max_points, reward, points_per_visit')
      .eq('code', card_code.toUpperCase())
      .eq('merchant_id', auth.merchantId)
      .eq('is_active', true)
      .maybeSingle()

    if (cardErr || !card) {
      return NextResponse.json({ error: 'Card not found or does not belong to your account' }, { status: 404 })
    }

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id, name')
      .eq('phone', phone)
      .maybeSingle()

    if (!client) {
      return NextResponse.json({ error: 'Client not found. They must first join the card via the app.' }, { status: 404 })
    }

    const { data: clientCard } = await supabaseAdmin
      .from('client_cards')
      .select('id, points, total_points_earned, total_rewards_redeemed')
      .eq('client_id', client.id)
      .eq('card_id', card.id)
      .maybeSingle()

    if (!clientCard) {
      return NextResponse.json({ error: 'Client has not joined this card yet' }, { status: 404 })
    }

    const newPoints = clientCard.points + points
    const rewardReached = newPoints >= card.max_points

    await supabaseAdmin
      .from('client_cards')
      .update({
        points: newPoints,
        total_points_earned: clientCard.total_points_earned + points,
        last_validation_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientCard.id)

    await supabaseAdmin.from('activities').insert({
      merchant_id: auth.merchantId,
      card_id: card.id,
      client_id: client.id,
      client_card_id: clientCard.id,
      type: 'pts',
      points_amount: points,
      description: `API: +${points} point${points > 1 ? 's' : ''}`,
    })

    return NextResponse.json({
      success: true,
      client_name: client.name,
      points: newPoints,
      max_points: card.max_points,
      reward_reached: rewardReached,
      reward: rewardReached ? card.reward : null,
    })

  } catch (e: any) {
    console.error('[API] points/add error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
