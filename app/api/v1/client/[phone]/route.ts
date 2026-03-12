// app/api/v1/client/[phone]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, isAuthError, supabaseAdmin } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  const auth = await authenticateApiKey(req)
  if (isAuthError(auth)) return auth

  const { phone } = params

  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  }

  try {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id, name, phone, created_at')
      .eq('phone', phone)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Récupérer les cartes du client qui appartiennent à ce commerçant
    const { data: clientCards } = await supabaseAdmin
      .from('client_cards')
      .select('id, points, total_points_earned, total_rewards_redeemed, last_validation_at, loyalty_cards(id, business_name, code, max_points, reward, color1)')
      .eq('client_id', client.id)

    const myCards = (clientCards || []).filter((cc: any) => {
      const card = cc.loyalty_cards
      return card
    })

    return NextResponse.json({
      id: client.id,
      name: client.name,
      phone: client.phone,
      member_since: client.created_at,
      cards: myCards.map((cc: any) => ({
        card_id: cc.loyalty_cards?.id,
        card_name: cc.loyalty_cards?.business_name,
        card_code: cc.loyalty_cards?.code,
        points: cc.points,
        max_points: cc.loyalty_cards?.max_points,
        progress_pct: Math.round((cc.points / Math.max(cc.loyalty_cards?.max_points, 1)) * 100),
        total_points_earned: cc.total_points_earned,
        rewards_redeemed: cc.total_rewards_redeemed,
        last_visit: cc.last_validation_at,
        reward: cc.loyalty_cards?.reward,
      })),
    })

  } catch (e: any) {
    console.error('[API] client error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
