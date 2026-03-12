// app/api/v1/reward/redeem/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, isAuthError, getSupabaseAdmin } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (isAuthError(auth)) return auth

  let body: any
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }

  const { card_code, phone } = body

  if (!card_code || !phone) {
    return NextResponse.json({ error: 'card_code and phone are required' }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: card } = await supabaseAdmin
      .from('loyalty_cards')
      .select('id, merchant_id, max_points, reward')
      .eq('code', card_code.toUpperCase())
      .eq('merchant_id', auth.merchantId)
      .eq('is_active', true)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found or does not belong to your account' }, { status: 404 })
    }

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id, name')
      .eq('phone', phone)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: clientCard } = await supabaseAdmin
      .from('client_cards')
      .select('id, points, total_rewards_redeemed')
      .eq('client_id', client.id)
      .eq('card_id', card.id)
      .single()

    if (!clientCard) {
      return NextResponse.json({ error: 'Client has not joined this card' }, { status: 404 })
    }

    if (clientCard.points < card.max_points) {
      return NextResponse.json({
        error: 'Not enough points',
        current_points: clientCard.points,
        required_points: card.max_points,
      }, { status: 400 })
    }

    await supabaseAdmin
      .from('client_cards')
      .update({
        points: 0,
        total_rewards_redeemed: clientCard.total_rewards_redeemed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientCard.id)

    await supabaseAdmin.from('activities').insert({
      merchant_id: auth.merchantId,
      card_id: card.id,
      client_id: client.id,
      client_card_id: clientCard.id,
      type: 'redeem',
      points_amount: card.max_points,
      description: `API: Récompense validée — ${card.reward}`,
    })

    return NextResponse.json({
      success: true,
      client_name: client.name,
      reward: card.reward,
      points_reset: true,
      total_rewards: clientCard.total_rewards_redeemed + 1,
    })

  } catch (e: any) {
    console.error('[API] reward/redeem error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
