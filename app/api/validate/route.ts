import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { presenceId, action } = body // action: 'validate' | 'reject'
    if (!presenceId || !action) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    const supabase = getAdmin()

    const { data: presence } = await supabase
      .from('pending_presences')
      .select('*, loyalty_cards(*)')
      .eq('id', presenceId)
      .maybeSingle()

    if (!presence) return NextResponse.json({ error: 'Presence not found' }, { status: 404 })
    if (presence.status !== 'pending') return NextResponse.json({ error: 'Already processed' }, { status: 400 })

    const dbStatus = action === 'validate' ? 'confirmed' : 'rejected'
    await supabase.from('pending_presences').update({ status: dbStatus, resolved_at: new Date().toISOString() }).eq('id', presenceId)

    if (action === 'validate') {
      const { data: clientCard } = await supabase
        .from('client_cards')
        .select('*')
        .eq('id', presence.client_card_id)
        .maybeSingle()

      if (clientCard) {
        const card = presence.loyalty_cards
        const maxPts = card?.max_points || 10
        const newPts = Math.min((clientCard.points || 0) + (card?.points_per_visit || 1), maxPts)
        const reward = newPts >= maxPts

        const isAuto = body.auto === true
        await supabase.from('client_cards').update({
          points: reward ? 0 : newPts,
          total_rewards_redeemed: (clientCard.total_rewards_redeemed || 0) + (reward ? 1 : 0),
          total_points_earned: (clientCard.total_points_earned || 0) + (card?.points_per_visit || 1),
          auto_validated_points: (clientCard.auto_validated_points || 0) + (isAuto ? (card?.points_per_visit || 1) : 0),
        }).eq('id', clientCard.id)

        await supabase.from('activities').insert({
          merchant_id: presence.merchant_id,
          card_id: presence.card_id,
          client_id: presence.client_id,
          type: 'validation',
          points_amount: card?.points_per_visit || 1,
          description: `✅ Visite validée pour ${presence.client_name}`,
        })
      }
    }

    return NextResponse.json({ success: true, status: dbStatus })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
