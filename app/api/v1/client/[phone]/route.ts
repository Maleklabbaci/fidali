// app/api/v1/client/[phone]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, isAuthError, getSupabaseAdmin } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  const auth = await authenticateApiKey(req)
  if (isAuthError(auth)) return auth

  const { phone } = params

  if (!phone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id, name, phone, created_at')
      .eq('phone', decodeURIComponent(phone))
      .maybeSingle()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: clientCards } = await supabaseAdmin
      .from('client_cards')
      .select('id, points, total_points_earned, total_rewards_redeemed, created_at, loyalty_cards(id, code, business_name, max_points, reward)')
      .eq('client_id', client.id)

    return NextResponse.json({
      client: {
        name: client.name,
        phone: client.phone,
        member_since: client.created_at,
      },
      cards: (clientCards || []).map((cc: any) => ({
        card_code: cc.loyalty_cards?.code,
        business_name: cc.loyalty_cards?.business_name,
        points: cc.points,
        max_points: cc.loyalty_cards?.max_points,
        reward: cc.loyalty_cards?.reward,
        total_points_earned: cc.total_points_earned,
        total_rewards_redeemed: cc.total_rewards_redeemed,
        joined_at: cc.created_at,
      })),
    })

  } catch (e: any) {
    console.error('[API] client/phone error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
