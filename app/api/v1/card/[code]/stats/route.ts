// app/api/v1/card/[code]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, isAuthError, getSupabaseAdmin } from '@/lib/api-auth'

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const auth = await authenticateApiKey(req)
  if (isAuthError(auth)) return auth

  const { code } = params

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data: card } = await supabaseAdmin
      .from('loyalty_cards')
      .select('id, business_name, code, max_points, reward, color1, color2, created_at')
      .eq('code', code.toUpperCase())
      .eq('merchant_id', auth.merchantId)
      .eq('is_active', true)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const [{ count: totalClients }, { data: activities }] = await Promise.all([
      supabaseAdmin.from('client_cards').select('id', { count: 'exact', head: true }).eq('card_id', card.id),
      supabaseAdmin.from('activities').select('type, points_amount, created_at').eq('card_id', card.id).gte('created_at', weekAgo),
    ])

    const acts = activities || []
    const visitsToday = acts.filter((a: any) => a.created_at.startsWith(today)).length
    const visitsWeek = acts.filter((a: any) => a.type === 'pts').length
    const rewardsGiven = acts.filter((a: any) => a.type === 'redeem').length

    return NextResponse.json({
      card_name: card.business_name,
      code: card.code,
      max_points: card.max_points,
      reward: card.reward,
      stats: {
        total_clients: totalClients || 0,
        visits_today: visitsToday,
        visits_this_week: visitsWeek,
        rewards_given_this_week: rewardsGiven,
      },
      created_at: card.created_at,
    })

  } catch (e: any) {
    console.error('[API] card/stats error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
